import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Code2, Terminal, CheckCircle2, Filter, Target } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { branches } from "../data/branches";
import { practiceTopics, type PracticeTopic } from "@/data/practiceTopics";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PracticeProblem, { type PracticeExecutionPayload } from "../components/PracticeProblem";
import { getLearnerDnaSummary, recordPracticeExecution } from "@/services/learnerProfileService";
import { completeTodayMissionTask, getTodayMission } from "@/services/missionEngine";
import { toast } from "sonner";

const sampleProblem = {
  id: "problem-1",
  title: "Two Sum",
  description:
    "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.",
  difficulty: "Easy" as const,
  language: "javascript" as const,
  template: `function twoSum(nums, target) {
  // Your solution here
  return [];
}

const fs = require("fs");
const rawInput = fs.readFileSync(0, "utf8").trim();

if (rawInput) {
  const { nums, target } = JSON.parse(rawInput);
  const result = twoSum(nums, target);
  process.stdout.write(JSON.stringify(result));
}`,
  testCases: [
    {
      input: "{\"nums\":[2,7,11,15],\"target\":9}",
      expected: "[0,1]",
      explanation: "nums[0] + nums[1] == 9",
    },
    {
      input: "{\"nums\":[3,2,4],\"target\":6}",
      expected: "[1,2]",
      explanation: "nums[1] + nums[2] == 6",
    },
    {
      input: "{\"nums\":[3,3],\"target\":6}",
      expected: "[0,1]",
      explanation: "nums[0] + nums[1] == 6",
    },
  ],
};

const PracticePage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBranch, setSelectedBranch] = useState(user?.branch || "");
  const [showBranchFilter, setShowBranchFilter] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<PracticeTopic | null>(null);
  const [dna, setDna] = useState(() =>
    user ? getLearnerDnaSummary(user.id, user.branch) : null,
  );

  const missionTaskId = searchParams.get("missionTaskId");
  const selectedTopicId = searchParams.get("topic");

  useEffect(() => {
    if (!user) return;
    setDna(getLearnerDnaSummary(user.id, user.branch));
  }, [user]);

  useEffect(() => {
    if (!selectedTopicId) return;
    const topic = practiceTopics.find((candidate) => candidate.id === selectedTopicId);
    if (topic) {
      setSelectedProblem(topic);
    }
  }, [selectedTopicId]);

  const filteredTopics = selectedBranch
    ? practiceTopics.filter((topic) => {
        if (selectedBranch === "ece") return topic.language === "verilog" || topic.language === "python";
        if (selectedBranch === "data-science") return topic.language === "python" || topic.language === "sql";
        if (selectedBranch === "cse") return topic.language !== "verilog";
        return true;
      })
    : practiceTopics;

  const activeProblem = useMemo(
    () =>
      selectedProblem
        ? {
            ...sampleProblem,
            id: `${sampleProblem.id}-${selectedProblem.id}`,
            language: selectedProblem.language,
            title: `${sampleProblem.title} (${selectedProblem.title})`,
          }
        : null,
    [selectedProblem],
  );

  const currentBranch = branches.find((branch) => branch.id === selectedBranch);

  const handleSelectProblem = (topic: PracticeTopic) => {
    setSelectedProblem(topic);
    const params = new URLSearchParams(searchParams);
    params.set("topic", topic.id);
    setSearchParams(params, { replace: true });
  };

  const handleBackToProblems = () => {
    setSelectedProblem(null);
    const params = new URLSearchParams(searchParams);
    params.delete("topic");
    params.delete("missionTaskId");
    setSearchParams(params, { replace: true });
  };

  const handleExecutionComplete = (payload: PracticeExecutionPayload) => {
    if (!user) return;

    recordPracticeExecution(user.id, {
      branch: user.branch,
      problemId: payload.problemId,
      problemTitle: payload.problemTitle,
      topicId: payload.topicId,
      topicTitle: payload.topicTitle,
      language: payload.runtimeName ?? payload.language,
      passedTests: payload.passedTests,
      totalTests: payload.totalTests,
      tookMs: payload.tookMs,
      results: payload.results,
    });

    setDna(getLearnerDnaSummary(user.id, user.branch));

    if (
      missionTaskId &&
      payload.totalTests > 0 &&
      payload.passedTests === payload.totalTests
    ) {
      const currentMission = getTodayMission(user.id, user.branch);
      const currentTask = currentMission.tasks.find((task) => task.id === missionTaskId);
      if (currentTask?.status === "pending") {
        completeTodayMissionTask(user.id, user.branch, missionTaskId);
        toast.success("Mission progress updated. Task completed.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-foreground">Practice Problems</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Personalized coding workouts powered by your performance, branch goals, and mission progress.
          </p>
          {currentBranch && (
            <p className="mt-3 text-sm font-medium text-primary">
              Showing problems for {currentBranch.name}
            </p>
          )}
        </motion.div>

        {missionTaskId && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-4"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Target className="h-4 w-4" />
              Mission Mode Active
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Pass all tests to complete this mission task and update your daily streak.
            </p>
          </motion.div>
        )}

        {selectedProblem && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 border-b border-border pb-12"
          >
            <Button variant="outline" onClick={handleBackToProblems} className="mb-4">
              ← Back to Problems
            </Button>
            {activeProblem && (
              <PracticeProblem
                {...activeProblem}
                topicId={selectedProblem.id}
                topicTitle={selectedProblem.title}
                onExecutionComplete={handleExecutionComplete}
              />
            )}
          </motion.div>
        )}

        {!selectedProblem && (
          <>
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

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-10 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center"
            >
              <Terminal className="mx-auto mb-3 h-10 w-10 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Live Multi-Language IDE</h2>
              <p className="mt-2 text-muted-foreground">
                Real execution with secure backend runtimes and per-test-case diagnostics. Built-in JavaScript fallback works by default; connect Judge0/RapidAPI for full multi-language coverage.
              </p>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTopics.map((topic, index) => (
                <motion.button
                  key={topic.id}
                  onClick={() => handleSelectProblem(topic)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="group rounded-xl border border-border bg-gradient-card p-6 text-left shadow-card transition-all hover:border-primary/30 hover:shadow-lg"
                >
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${topic.color}20`, color: topic.color }}
                  >
                    <Code2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                    {topic.title}
                  </h3>
                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{topic.problems} problems</span>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs">{topic.difficulty}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 grid gap-4 md:grid-cols-3"
            >
              <Card className="border border-border/50 bg-gradient-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Problems Solved</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">{dna?.solvedProblems ?? 0}</p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
              </Card>

              <Card className="border border-border/50 bg-gradient-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">{dna?.acceptanceRate ?? 0}%</p>
                  </div>
                  <div className="text-2xl">📊</div>
                </div>
              </Card>

              <Card className="border border-border/50 bg-gradient-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">{dna?.streak ?? 0} days</p>
                  </div>
                  <div className="text-2xl">🔥</div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default PracticePage;
