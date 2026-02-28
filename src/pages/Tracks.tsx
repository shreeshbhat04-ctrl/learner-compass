import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Filter, Loader2, Search } from "lucide-react";
import TrackCard from "../components/TrackCard";
import CourseCard from "../components/CourseCard";
import { useAuth } from "../context/AuthContext";
import { getTracksByBranch } from "../services/trackService";
import { branches } from "../data/branches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchCatalog } from "@/services/searchService";
import type { SearchHit } from "@/shared/catalogSearch";

const TracksPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showBranchFilter, setShowBranchFilter] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(user?.branch || "");
  const [isSearching, setIsSearching] = useState(false);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchTookMs, setSearchTookMs] = useState(0);
  const [searchSource, setSearchSource] = useState<"api" | "fallback">("api");
  const [searchResults, setSearchResults] = useState<SearchHit[]>([]);

  const allTracks = useMemo(() => getTracksByBranch(selectedBranch || undefined), [selectedBranch]);
  const trackById = useMemo(() => new Map(getTracksByBranch().map((track) => [track.id, track])), []);
  const normalizedQuery = searchQuery.trim();

  useEffect(() => {
    if (!normalizedQuery) {
      setSearchResults([]);
      setSearchTotal(0);
      setSearchTookMs(0);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await searchCatalog({
          q: normalizedQuery,
          branch: selectedBranch || undefined,
          type: "all",
          limit: 24,
          signal: controller.signal,
        });

        setSearchResults(response.results);
        setSearchTotal(response.total);
        setSearchTookMs(response.tookMs);
        setSearchSource(response.source);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setSearchResults([]);
        setSearchTotal(0);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [normalizedQuery, selectedBranch]);

  const trackResults = useMemo(() => {
    if (!normalizedQuery) {
      return allTracks;
    }

    return searchResults
      .filter((result) => result.type === "track")
      .map((result) => trackById.get(result.trackId))
      .filter(Boolean);
  }, [allTracks, normalizedQuery, searchResults, trackById]);

  const courseResults = useMemo(() => searchResults.filter((result) => result.type === "course"), [searchResults]);
  const currentBranch = branches.find((branch) => branch.id === selectedBranch);

  return (
    <div className="min-h-screen bg-background pb-16 pt-24">
      <div className="container">
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-semibold text-foreground">Tracks</h1>
          <p className="mt-2 text-muted-foreground">Find the right path quickly with focused search and filtering.</p>
          {currentBranch && <p className="mt-2 text-sm font-medium text-primary">Showing tracks for {currentBranch.name}</p>}
        </motion.section>

        <section className="mb-8 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search tracks, courses, and skills"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-11 pl-10"
              />
            </div>

            {user && (
              <Button
                variant={showBranchFilter ? "default" : "outline"}
                onClick={() => setShowBranchFilter((value) => !value)}
                className="h-11 gap-2"
              >
                <Filter className="h-4 w-4" />
                Branch Filter
              </Button>
            )}
          </div>

          {showBranchFilter && user && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
                {branches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => setSelectedBranch(selectedBranch === branch.id ? "" : branch.id)}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      selectedBranch === branch.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary/50"
                    }`}
                  >
                    {branch.code}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </section>

        {normalizedQuery && (
          <div className="mb-8 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            {isSearching ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </span>
            ) : (
              <>
                <span>{searchTotal} matches</span>
                <span>in {searchTookMs}ms</span>
                <span>source: {searchSource}</span>
              </>
            )}
          </div>
        )}

        {trackResults.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trackResults.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <TrackCard {...track} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              {normalizedQuery ? "No track results found. Try another query." : "No tracks available for this branch."}
            </p>
          </div>
        )}

        {normalizedQuery && courseResults.length > 0 && (
          <section className="mt-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Course Matches</h2>
              <span className="text-sm text-muted-foreground">{courseResults.length} results</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courseResults.map((course, index) => (
                <motion.div
                  key={`${course.trackId}:${course.courseId}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <CourseCard
                    id={course.courseId ?? `${course.trackId}-${index}`}
                    title={course.title}
                    description={course.snippet || course.description}
                    duration={course.duration}
                    lessons={course.lessons ?? 0}
                    trackId={course.trackId}
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default TracksPage;
