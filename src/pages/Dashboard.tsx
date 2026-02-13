import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTracksByBranch } from "../services/trackService";
import { branches } from "../data/branches";
import TrackCard from "../components/TrackCard";
import BranchSelector from "../components/BranchSelector";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Flame, BookOpen, Clock, ArrowRight } from "lucide-react";

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showBranchDialog, setShowBranchDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="h-10 w-10 rounded-full border-4 border-border border-t-primary animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-24">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-4">Please log in</h1>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to access your dashboard.
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="shadow-glow hover:scale-105 transition-transform"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const tracksByBranch = getTracksByBranch(user.branch);
  const currentBranch = branches.find((b) => b.id === user.branch);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-foreground">
            Welcome back, <span className="text-gradient-primary">{user.name}</span>
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {currentBranch
              ? `You're enrolled in ${currentBranch.name}`
              : "Let's continue your learning journey"}
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 grid gap-4 md:grid-cols-3"
        >
          <Card className="border border-border/50 bg-gradient-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Tracks</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{tracksByBranch.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="border border-border/50 bg-gradient-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {tracksByBranch.reduce((sum, track) => sum + track.courses.length, 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-accent" />
              </div>
            </div>
          </Card>

          <Card className="border border-border/50 bg-gradient-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Learning Streak</p>
                <p className="mt-1 text-3xl font-bold text-foreground">0 days</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Branch Selector */}
        {tracksByBranch.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <Card className="border border-border/50 bg-gradient-card p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">Your Branch</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Switch your branch anytime to see different learning paths
                </p>
              </div>
              <BranchSelector />
            </Card>
          </motion.div>
        )}

        {/* Recommended Tracks */}
        {tracksByBranch.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Your Tracks</h2>
              <p className="mt-1 text-muted-foreground">
                Recommended learning paths based on your branch
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tracksByBranch.map((track, i) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  <TrackCard {...track} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {tracksByBranch.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-muted/30 p-12 text-center"
          >
            <p className="text-muted-foreground mb-4">
              No tracks available for your selected branch yet.
            </p>
            <Button
              onClick={() => setShowBranchDialog(true)}
              className="shadow-glow hover:scale-105 transition-transform"
            >
              Change Branch
            </Button>
          </motion.div>
        )}
      </div>

      {/* Branch Dialog */}
      <Dialog open={showBranchDialog} onOpenChange={setShowBranchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Your Branch</DialogTitle>
          </DialogHeader>
          <BranchSelector />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
