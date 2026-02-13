import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Check, X, Copy, RefreshCw, Lightbulb, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface PracticeProblemProps {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  language: "javascript" | "python" | "sql" | "verilog";
  template: string;
  testCases: Array<{
    input: string;
    expected: string;
    explanation?: string;
  }>;
}

interface TestResult {
  testCase: number;
  passed: boolean;
  actual?: string;
  expected: string;
}

const PracticeProblem = ({
  id,
  title,
  description,
  difficulty,
  language,
  template,
  testCases,
}: PracticeProblemProps) => {
  const [code, setCode] = useState(template);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const difficultyColor = {
    Easy: "text-green-600",
    Medium: "text-yellow-600",
    Hard: "text-red-600",
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    // Simulate test execution
    setTimeout(() => {
      const results: TestResult[] = testCases.map((testCase, index) => ({
        testCase: index + 1,
        passed: Math.random() > 0.3,
        expected: testCase.expected,
        actual: Math.random() > 0.3 ? testCase.expected : "Wrong output",
      }));

      setTestResults(results);
      const passedCount = results.filter((r) => r.passed).length;
      toast.success(`${passedCount}/${testCases.length} tests passed`);
      setIsRunning(false);
    }, 1500);
  };

  const handleReset = () => {
    setCode(template);
    setTestResults([]);
    setShowHint(false);
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const passedTests = testResults.filter((r) => r.passed).length;
  const allTestsPassed = testResults.length > 0 && passedTests === testResults.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-border/50 bg-gradient-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            <p className={`text-sm font-semibold mt-2 ${difficultyColor[difficulty]}`}>
              {difficulty} • {language.toUpperCase()}
            </p>
          </div>
          {allTestsPassed && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Solved!</span>
            </div>
          )}
        </div>
        <p className="text-muted-foreground">{description}</p>
      </Card>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Problem Description & Hints */}
        <div className="space-y-4">
          <Card className="border border-border/50 bg-muted/30 p-6">
            <h3 className="font-semibold text-foreground mb-4">Problem Details</h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Input Format</h4>
                <p>An array of integers representing data points</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Output Format</h4>
                <p>A single integer representing the result</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Constraints</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>1 ≤ n ≤ 10^5</li>
                  <li>-10^9 ≤ arr[i] ≤ 10^9</li>
                  <li>Time Limit: 1 second</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Hint */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border/50 bg-blue-500/5 p-4"
          >
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Lightbulb className="h-4 w-4" />
              {showHint ? "Hide Hint" : "Show Hint"}
            </button>
            {showHint && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 text-sm text-muted-foreground"
              >
                Try using a hash map or set to track elements you've seen. Think about the optimal time and space complexity.
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* Code Editor */}
        <div className="space-y-4">
          <Card className="border border-border/50 bg-gradient-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Solution</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyTemplate}
                  className="gap-2"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Code Editor */}
            <div className="bg-muted rounded-lg border border-border overflow-hidden">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your solution here..."
                className="font-mono text-sm resize-none h-48 bg-muted border-0 focus-visible:ring-0"
              />
            </div>

            {/* Run Button */}
            <Button
              onClick={handleRunTests}
              disabled={isRunning}
              className="w-full shadow-glow hover:scale-105 transition-transform"
            >
              {isRunning ? (
                <>
                  <Play className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Tests
                </>
              )}
            </Button>
          </Card>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card className="border border-border/50 bg-gradient-card p-6">
          <h3 className="font-semibold text-foreground mb-4">
            Test Results: {passedTests}/{testResults.length} Passed
          </h3>
          <div className="space-y-3">
            {testResults.map((result, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-lg border p-4 ${
                  result.passed
                    ? "border-green-500/20 bg-green-500/5"
                    : "border-red-500/20 bg-red-500/5"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-foreground">Test Case {result.testCase}</span>
                  {result.passed ? (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <Check className="h-4 w-4" />
                      Passed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600 text-sm">
                      <X className="h-4 w-4" />
                      Failed
                    </span>
                  )}
                </div>
                {!result.passed && (
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">Expected:</span> {result.expected}
                    </p>
                    <p>
                      <span className="font-medium">Got:</span> {result.actual}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Submit Button */}
      {allTestsPassed && (
        <Button className="w-full h-11 shadow-glow hover:scale-105 transition-transform" size="lg">
          <Send className="h-4 w-4 mr-2" />
          Submit Solution
        </Button>
      )}
    </div>
  );
};

export default PracticeProblem;
