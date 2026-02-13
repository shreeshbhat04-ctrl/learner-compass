import { motion } from "framer-motion";
import { Code2, Terminal, Play, CheckCircle2 } from "lucide-react";

const practiceTopics = [
  { title: "JavaScript Challenges", problems: 120, difficulty: "Easy → Hard", color: "#4ade80" },
  { title: "Python Problems", problems: 95, difficulty: "Easy → Hard", color: "#06b6d4" },
  { title: "SQL Queries", problems: 60, difficulty: "Intermediate", color: "#eab308" },
  { title: "MATLAB Exercises", problems: 45, difficulty: "Intermediate", color: "#a78bfa" },
  { title: "Data Structures & Algorithms", problems: 150, difficulty: "Easy → Hard", color: "#f97316" },
  { title: "System Design", problems: 30, difficulty: "Advanced", color: "#ef4444" },
];

const PracticePage = () => {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-foreground">Practice</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Sharpen your skills with coding challenges, MATLAB exercises, and problem sets.
          </p>
        </motion.div>

        {/* Coming soon banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center"
        >
          <Terminal className="mx-auto mb-3 h-10 w-10 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Interactive Code Editor Coming Soon</h2>
          <p className="mt-2 text-muted-foreground">
            Practice problems with an in-browser code editor, powered by Judge0 for instant compilation and feedback.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {practiceTopics.map((topic, i) => (
            <motion.div
              key={topic.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="group rounded-xl border border-border bg-gradient-card p-6 shadow-card transition-all hover:border-primary/30"
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${topic.color}20`, color: topic.color }}
              >
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{topic.title}</h3>
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <span>{topic.problems} problems</span>
                <span className="rounded-md bg-secondary px-2 py-0.5 text-xs">{topic.difficulty}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PracticePage;
