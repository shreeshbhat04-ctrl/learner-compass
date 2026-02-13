import { motion } from "framer-motion";
import { useState } from "react";
import CourseCard from "../components/CourseCard";
import { useAuth } from "../context/AuthContext";
import { getTracksByBranch } from "../services/trackService";
import { branches } from "../data/branches";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

const CoursesPage = () => {
  const { user } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState(user?.branch || "");
  const [showBranchFilter, setShowBranchFilter] = useState(false);

  const filteredTracks = getTracksByBranch(selectedBranch || undefined);
  const allCourses = filteredTracks.flatMap((track) =>
    track.courses.map((course) => ({ ...course, trackTitle: track.title, trackColor: track.color }))
  );

  const currentBranch = branches.find((b) => b.id === selectedBranch);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-foreground">All Courses</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Browse all {allCourses.length} courses across {filteredTracks.length} learning tracks.
          </p>
          {currentBranch && (
            <p className="mt-3 text-sm text-primary font-medium">
              Showing courses for {currentBranch.name}
            </p>
          )}
        </motion.div>

        {/* Filter Button */}
        {user && (
          <div className="mb-8">
            <Button
              variant={showBranchFilter ? "default" : "outline"}
              onClick={() => setShowBranchFilter(!showBranchFilter)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter by Branch
            </Button>

            {showBranchFilter && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 rounded-lg border border-border bg-muted/30 p-4"
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
          </div>
        )}

        {filteredTracks.map((track) => (
          <div key={track.id} className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: track.color }}
              />
              <h2 className="text-xl font-semibold text-foreground">{track.title}</h2>
              <span className="text-sm text-muted-foreground">({track.courses.length} courses)</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {track.courses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  viewport={{ once: true }}
                >
                  <CourseCard {...course} trackId={track.id} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;
