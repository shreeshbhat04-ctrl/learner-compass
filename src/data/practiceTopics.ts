export type PracticeLanguage = "javascript" | "python" | "sql" | "verilog";
export type PracticeTier = "foundation" | "intermediate" | "advanced";

export interface PracticeTopic {
  id: string;
  title: string;
  problems: number;
  difficulty: string;
  color: string;
  language: PracticeLanguage;
  tier: PracticeTier;
}

export const practiceTopics: PracticeTopic[] = [
  {
    id: "js-challenges",
    title: "JavaScript Challenges",
    problems: 120,
    difficulty: "Easy → Hard",
    color: "#4ade80",
    language: "javascript",
    tier: "foundation",
  },
  {
    id: "python-problems",
    title: "Python Problems",
    problems: 95,
    difficulty: "Easy → Hard",
    color: "#06b6d4",
    language: "python",
    tier: "foundation",
  },
  {
    id: "sql-queries",
    title: "SQL Queries",
    problems: 60,
    difficulty: "Intermediate",
    color: "#eab308",
    language: "sql",
    tier: "intermediate",
  },
  {
    id: "verilog-exercises",
    title: "Verilog Exercises",
    problems: 45,
    difficulty: "Intermediate",
    color: "#a78bfa",
    language: "verilog",
    tier: "intermediate",
  },
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    problems: 150,
    difficulty: "Easy → Hard",
    color: "#f97316",
    language: "javascript",
    tier: "intermediate",
  },
  {
    id: "system-design",
    title: "System Design",
    problems: 30,
    difficulty: "Advanced",
    color: "#ef4444",
    language: "javascript",
    tier: "advanced",
  },
];
