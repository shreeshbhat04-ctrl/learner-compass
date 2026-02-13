import { motion } from "framer-motion";
import { useState } from "react";
import { Code2, Terminal, CheckCircle2, Filter } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getTracksByBranch } from "../services/trackService";
import { branches } from "../data/branches";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PracticeProblem from "../components/PracticeProblem";

const practiceTopics = [
  { title: "JavaScript Challenges", problems: 120, difficulty: "Easy → Hard", color: "#4ade80", language: "javascript" as const },
  { title: "Python Problems", problems: 95, difficulty: "Easy → Hard", color: "#06b6d4", language: "python" as const },
  { title: "SQL Queries", problems: 60, difficulty: "Intermediate", color: "#eab308", language: "sql" as const },
  { title: "Verilog Exercises", problems: 45, difficulty: "Intermediate", color: "#a78bfa", language: "verilog" as const },
  { title: "Data Structures & Algorithms", problems: 150, difficulty: "Easy → Hard", color: "#f97316", language: "javascript" as const },
  { title: "System Design", problems: 30, difficulty: "Advanced", color: "#ef4444", language: "javascript" as const },
];

const sampleProblem = {
  id: "problem-1",
  title: "Two Sum",
  description: "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.",
  difficulty: "Easy" as const,
  language: "javascript" as const,
  template: `function twoSum(nums, target) {
  // Your solution here
  return [];
}`,
  testCases: [
    { input: "nums = [2,7,11,15], target = 9", expected: "[0, 1]", explanation: "nums[0] + nums[1] == 9" },
    { input: "nums = [3,2,4], target = 6", expected: "[1, 2]", explanation: "nums[1] + nums[2] == 6" },
    { input: "nums = [3,3], target = 6", expected: "[0, 1]", explanation: "nums[0] + nums[1] == 6" },
  ],
};

const PracticePage = () => {
  const { user } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState(user?.branch || "");
  const [showBranchFilter, setShowBranchFilter] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);

  const filteredTopics = selectedBranch
    ? practiceTopics.slice(0, 3) // For branch-specific filtering, show relevant topics
    : practiceTopics;

  const currentBranch = branches.find((b) => b.id === selectedBranch);

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
            Sharpen your skills with coding challenges, MATLAB exercises, and problem sets.
          </p>
          {currentBranch && (
            <p className="mt-3 text-sm text-primary font-medium">
              Showing problems for {currentBranch.name}
            </p>
          )}
        </motion.div>

        {/* Show Problem Solver */}
        {selectedProblem && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 pb-12 border-b border-border"
          >
            <Button
              variant="outline"
              onClick={() => setSelectedProblem(null)}
              className="mb-4"
            >
              ← Back to Problems
            </Button>
            <PracticeProblem {...sampleProblem} />
          </motion.div>
        )}

        {/* Problem Browser */}
        {!selectedProblem && (
          <>
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

            {/* Coming soon banner */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-10 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center"
            >
              <Terminal className="mx-auto mb-3 h-10 w-10 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Interactive Code Editor</h2>
              <p className="mt-2 text-muted-foreground">
                Practice problems with an in-browser code editor, powered by Judge0 for instant compilation and feedback.
              </p>
            </motion.div>

            {/* Practice Topics Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTopics.map((topic, i) => (
                <motion.button
                  key={topic.title}
                  onClick={() => setSelectedProblem(topic.title)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="group rounded-xl border border-border bg-gradient-card p-6 shadow-card transition-all hover:border-primary/30 hover:shadow-lg text-left"
                >
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${topic.color}20`, color: topic.color }}
                  >
                    <Code2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {topic.title}
                  </h3>
                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{topic.problems} problems</span>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs">{topic.difficulty}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Stats */}
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
                    <p className="mt-1 text-3xl font-bold text-foreground">24</p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
              </Card>

              <Card className="border border-border/50 bg-gradient-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">87%</p>
                  </div>
                  <div className="text-2xl">📊</div>
                </div>
              </Card>

              <Card className="border border-border/50 bg-gradient-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">7 days</p>
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
