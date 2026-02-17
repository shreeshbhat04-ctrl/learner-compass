import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Brain, Flame, Gauge, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import {
  completeTodayMissionTask,
  getTodayMission,
  missionCompletionPercent,
  type DailyMission,
  type MissionTask,
} from "@/services/missionEngine";
import { getLearnerDnaSummary } from "@/services/learnerProfileService";
import { branches } from "@/data/branches";

const taskTone = {
  recovery: "border-yellow-500/20 bg-yellow-500/5",
  momentum: "border-green-500/20 bg-green-500/5",
  stretch: "border-purple-500/20 bg-purple-500/5",
} as const;

const MissionPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [mission, setMission] = useState<DailyMission | null>(null);
  const dna = user ? getLearnerDnaSummary(user.id, user.branch) : null;

  useEffect(() => {
    if (!user) return;
    setMission(getTodayMission(user.id, user.branch));
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pt-24">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary"></div>
          <p className="text-muted-foreground">Building today’s mission...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pt-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Please log in</h1>
          <p className="mt-2 text-muted-foreground">Your personalized mission needs your profile.</p>
          <Button onClick={() => navigate("/login")} className="mt-6">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (!mission) {
    return null;
  }

  const currentBranch = branches.find((branch) => branch.id === user.branch);
  const completion = missionCompletionPercent(mission);
  const completedTasks = mission.tasks.filter((task) => task.status === "completed").length;

  const handleStartTask = (task: MissionTask) => {
    navigate(task.targetPath);
  };

  const handleMarkComplete = (taskId: string) => {
    setMission(completeTodayMissionTask(user.id, user.branch, taskId));
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-accent/10 p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-primary">Today Mission</p>
              <h1 className="mt-1 text-3xl font-bold text-foreground">
                {user.name}, your adaptive plan is ready
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {currentBranch?.name ?? "Your branch"} • Focus: {mission.adaptiveFocus.toUpperCase()}
              </p>
            </div>
            <div className="min-w-[220px] rounded-xl border border-border bg-background/80 p-4">
              <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>Daily completion</span>
                <span>{completion}%</span>
              </div>
              <Progress value={completion} />
              <p className="mt-2 text-xs text-muted-foreground">
                {completedTasks}/{mission.tasks.length} tasks completed
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mb-10 grid gap-4 md:grid-cols-4">
          <Card className="border border-border/50 bg-gradient-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{dna?.streak ?? 0} days</p>
              </div>
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
          </Card>
          <Card className="border border-border/50 bg-gradient-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Acceptance</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{dna?.acceptanceRate ?? 0}%</p>
              </div>
              <Gauge className="h-6 w-6 text-primary" />
            </div>
          </Card>
          <Card className="border border-border/50 bg-gradient-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Strongest</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {(dna?.strongestLanguage ?? "building").toUpperCase()}
                </p>
              </div>
              <Sparkles className="h-6 w-6 text-green-500" />
            </div>
          </Card>
          <Card className="border border-border/50 bg-gradient-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Focus Gap</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {(dna?.focusLanguage ?? mission.adaptiveFocus).toUpperCase()}
                </p>
              </div>
              <Brain className="h-6 w-6 text-purple-500" />
            </div>
          </Card>
        </div>

        <div className="grid gap-4">
          {mission.tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`border p-5 ${taskTone[task.kind]}`}>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-xs uppercase">
                        {task.kind}
                      </span>
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-xs">
                        {task.language.toUpperCase()}
                      </span>
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-xs">
                        {task.estimatedMinutes} min
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs ${
                          task.status === "completed"
                            ? "bg-green-500/15 text-green-600"
                            : "bg-yellow-500/15 text-yellow-600"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{task.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
                      <Target className="h-3.5 w-3.5" />
                      {task.reason}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => handleMarkComplete(task.id)}>
                      Mark Complete
                    </Button>
                    <Button onClick={() => handleStartTask(task)}>
                      {task.status === "completed" ? "Practice Again" : "Start Task"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {dna && dna.topMistakes.length > 0 && (
          <Card className="mt-10 border border-border/50 bg-gradient-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Failure Memory</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              These are your most repeated failure patterns. Your next missions adapt to these.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {dna.topMistakes.map((pattern) => (
                <span
                  key={pattern.key}
                  className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-foreground"
                >
                  {pattern.label} ×{pattern.count}
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MissionPage;
