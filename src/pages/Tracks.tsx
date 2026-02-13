import { motion } from "framer-motion";
import { useState } from "react";
import TrackCard from "../components/TrackCard";
import { useAuth } from "../context/AuthContext";
import { getTracksByBranch } from "../services/trackService";
import { branches } from "../data/branches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

const TracksPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showBranchFilter, setShowBranchFilter] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(user?.branch || "");

  const allTracks = getTracksByBranch(selectedBranch || undefined);
  
  const filteredTracks = allTracks.filter((track) => {
    const query = searchQuery.toLowerCase();
    return (
      track.title.toLowerCase().includes(query) ||
      track.description.toLowerCase().includes(query)
    );
  });

  const currentBranch = branches.find((b) => b.id === selectedBranch);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-foreground">Learning Tracks</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Choose a track and follow a structured path to mastery. No searching — everything is laid out for you.
          </p>
          {currentBranch && (
            <p className="mt-3 text-sm text-primary font-medium">
              Showing tracks for {currentBranch.name}
            </p>
          )}
        </motion.div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tracks by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {user && (
            <Button
              variant={showBranchFilter ? "default" : "outline"}
              onClick={() => setShowBranchFilter(!showBranchFilter)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Branch Filter
            </Button>
          )}
        </div>

        {/* Branch Filter Dropdown */}
        {showBranchFilter && user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 rounded-lg border border-border bg-muted/30 p-4"
          >
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => setSelectedBranch(selectedBranch === branch.id ? "" : branch.id)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    selectedBranch === branch.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {branch.code}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tracks Grid */}
        {filteredTracks.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTracks.map((track, i) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <TrackCard {...track} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-muted/30 p-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No tracks match your search. Try a different query."
                : "No tracks available for this branch."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TracksPage;
