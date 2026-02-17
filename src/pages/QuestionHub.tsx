import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Code2, ExternalLink, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { tracks } from "@/data/tracks";
import { branches } from "@/data/branches";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchCourseQuestions,
  type CourseQuestion,
} from "@/services/courseQuestionService";
import CourseLabIDE from "@/components/CourseLabIDE";

const ALL_BRANCHES = "all-branches";
const ALL_COURSES = "all-courses";

const parseKeywords = (value: string): string[] =>
  value
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 1)
    .slice(0, 10);

const QuestionHubPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTrackId = searchParams.get("trackId") ?? "";
  const initialCourseId = searchParams.get("courseId") ?? ALL_COURSES;
  const [selectedBranch, setSelectedBranch] = useState(user?.branch ?? ALL_BRANCHES);
  const [selectedTrackId, setSelectedTrackId] = useState(initialTrackId);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [keywordInput, setKeywordInput] = useState("");
  const [results, setResults] = useState<CourseQuestion[]>([]);
  const [queryUsed, setQueryUsed] = useState("");
  const [sourceSummary, setSourceSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<CourseQuestion | null>(null);

  const filteredTracks = useMemo(
    () =>
      selectedBranch === ALL_BRANCHES
        ? tracks
        : tracks.filter((track) => track.branches.includes(selectedBranch)),
    [selectedBranch],
  );

  const selectedTrack = useMemo(
    () => filteredTracks.find((track) => track.id === selectedTrackId) ?? null,
    [filteredTracks, selectedTrackId],
  );

  const selectedCourse = useMemo(() => {
    if (!selectedTrack || selectedCourseId === ALL_COURSES) return null;
    return selectedTrack.courses.find((course) => course.id === selectedCourseId) ?? null;
  }, [selectedTrack, selectedCourseId]);

  useEffect(() => {
    if (!filteredTracks.some((track) => track.id === selectedTrackId)) {
      setSelectedTrackId(filteredTracks[0]?.id ?? "");
      setSelectedCourseId(ALL_COURSES);
    }
  }, [filteredTracks, selectedTrackId]);

  useEffect(() => {
    if (!selectedTrack) return;
    if (
      selectedCourseId !== ALL_COURSES &&
      !selectedTrack.courses.some((course) => course.id === selectedCourseId)
    ) {
      setSelectedCourseId(ALL_COURSES);
    }
  }, [selectedCourseId, selectedTrack]);

  const refreshQuestions = useCallback(async () => {
    if (!selectedTrack) {
      setResults([]);
      setSelectedQuestion(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchCourseQuestions({
        branch: selectedBranch === ALL_BRANCHES ? undefined : selectedBranch,
        trackId: selectedTrack.id,
        trackTitle: selectedTrack.title,
        courseId: selectedCourse?.id,
        courseTitle: selectedCourse?.title,
        keywords: parseKeywords(keywordInput),
        limit: 12,
      });

      setResults(response.results);
      setQueryUsed(response.query);
      setSourceSummary(response.sources.join(", "));
      setSelectedQuestion((previous) =>
        previous && response.results.some((question) => question.id === previous.id)
          ? previous
          : response.results[0] ?? null,
      );
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load question recommendations.",
      );
      setResults([]);
      setSelectedQuestion(null);
    } finally {
      setIsLoading(false);
    }
  }, [keywordInput, selectedBranch, selectedCourse, selectedTrack]);

  useEffect(() => {
    if (!selectedTrack) return;
    void refreshQuestions();
  }, [refreshQuestions, selectedTrack]);

  const difficultyBadgeClass = (difficulty: CourseQuestion["difficulty"]): string => {
    if (difficulty === "Beginner") return "bg-green-500/10 text-green-700 border-green-500/20";
    if (difficulty === "Intermediate") return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
    return "bg-rose-500/10 text-rose-700 border-rose-500/20";
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-border/50 bg-gradient-card p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Question Hub</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Aggregated questions from top learning sources, filtered by your track and course.
              </p>
            </div>
            <Button onClick={() => void refreshQuestions()} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Questions
                </>
              )}
            </Button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Branch
              </p>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_BRANCHES}>All branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.code} • {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Track
              </p>
              <Select
                value={selectedTrackId || undefined}
                onValueChange={(value) => {
                  setSelectedTrackId(value);
                  setSelectedCourseId(ALL_COURSES);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose track" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTracks.map((track) => (
                    <SelectItem key={track.id} value={track.id}>
                      {track.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Course
              </p>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_COURSES}>All courses in track</SelectItem>
                  {(selectedTrack?.courses ?? []).map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Optional Keywords (comma separated)
            </p>
            <input
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Example: graph, dynamic programming, docker, microservices"
            />
          </div>

          {queryUsed && (
            <p className="mt-3 text-xs text-muted-foreground">
              Query used: <span className="font-medium text-foreground">{queryUsed}</span>
              {sourceSummary ? ` • Sources: ${sourceSummary}` : ""}
            </p>
          )}
        </motion.div>

        {error && (
          <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mb-10 grid gap-4 lg:grid-cols-2">
          {results.map((question, index) => {
            const isActive = selectedQuestion?.id === question.id;
            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card
                  className={`h-full border p-5 transition-colors ${
                    isActive
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/60 bg-gradient-card hover:border-primary/25"
                  }`}
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge className={`border ${difficultyBadgeClass(question.difficulty)}`}>
                      {question.difficulty}
                    </Badge>
                    <Badge variant="secondary">{question.type}</Badge>
                    <Badge variant="outline">{question.sourceLabel}</Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground">{question.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{question.summary}</p>

                  {question.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {question.tags.slice(0, 6).map((tag) => (
                        <span
                          key={`${question.id}-${tag}`}
                          className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant={isActive ? "default" : "outline"}
                      onClick={() => setSelectedQuestion(question)}
                    >
                      <Code2 className="mr-1.5 h-3.5 w-3.5" />
                      Open in IDE
                    </Button>
                    <a
                      href={question.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      View Source
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {!isLoading && results.length === 0 && !error && (
          <Card className="mb-8 border border-border/50 bg-gradient-card p-6">
            <div className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              No questions yet
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Change branch/track/course or add keywords, then refresh.
            </p>
          </Card>
        )}

        <CourseLabIDE selectedQuestion={selectedQuestion} />
      </div>
    </div>
  );
};

export default QuestionHubPage;
