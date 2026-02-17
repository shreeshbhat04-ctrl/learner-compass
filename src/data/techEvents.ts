export type TechEventCategory =
  | "Hackathon"
  | "AI Challenge"
  | "Cybersecurity"
  | "Open Source Program"
  | "Build Sprint";

export type TechEventMode = "Online" | "Hybrid" | "In-person";

export interface TechEvent {
  id: string;
  title: string;
  organizer: string;
  category: TechEventCategory;
  mode: TechEventMode;
  location: string;
  registrationDeadline: string;
  eventStart: string;
  eventEnd: string;
  prize: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  url: string;
  tags: string[];
}

export const techEvents: TechEvent[] = [
  {
    id: "gsoc-2026",
    title: "Google Summer of Code 2026",
    organizer: "Google Open Source",
    category: "Open Source Program",
    mode: "Online",
    location: "Global",
    registrationDeadline: "2026-03-28",
    eventStart: "2026-05-27",
    eventEnd: "2026-09-01",
    prize: "Stipend by program guidelines",
    level: "Intermediate",
    url: "https://summerofcode.withgoogle.com/",
    tags: ["open source", "mentorship", "engineering"],
  },
  {
    id: "mlh-season-2026",
    title: "MLH Global Hack Week 2026",
    organizer: "Major League Hacking",
    category: "Hackathon",
    mode: "Online",
    location: "Global",
    registrationDeadline: "2026-03-05",
    eventStart: "2026-03-16",
    eventEnd: "2026-03-22",
    prize: "Swag, certificates, sponsor prizes",
    level: "Beginner",
    url: "https://mlh.io/seasons/2026/events",
    tags: ["web", "mobile", "ai", "beginner-friendly"],
  },
  {
    id: "ethglobal-sf-2026",
    title: "ETHGlobal San Francisco 2026",
    organizer: "ETHGlobal",
    category: "Hackathon",
    mode: "In-person",
    location: "San Francisco, USA",
    registrationDeadline: "2026-04-12",
    eventStart: "2026-04-24",
    eventEnd: "2026-04-26",
    prize: "Track bounties from partners",
    level: "Advanced",
    url: "https://ethglobal.com/events",
    tags: ["web3", "smart contracts", "systems"],
  },
  {
    id: "kaggle-playground-2026-q2",
    title: "Kaggle Playground Series Q2 2026",
    organizer: "Kaggle",
    category: "AI Challenge",
    mode: "Online",
    location: "Global",
    registrationDeadline: "2026-04-30",
    eventStart: "2026-04-01",
    eventEnd: "2026-05-31",
    prize: "Medals and ranking points",
    level: "Intermediate",
    url: "https://www.kaggle.com/competitions",
    tags: ["machine learning", "data science", "python"],
  },
  {
    id: "nasa-space-apps-2026",
    title: "NASA Space Apps Challenge 2026",
    organizer: "NASA",
    category: "Hackathon",
    mode: "Hybrid",
    location: "Multiple Cities",
    registrationDeadline: "2026-09-20",
    eventStart: "2026-10-03",
    eventEnd: "2026-10-04",
    prize: "Global nominee recognition",
    level: "Intermediate",
    url: "https://www.spaceappschallenge.org/",
    tags: ["data", "science", "climate", "space tech"],
  },
  {
    id: "hackthebox-ctf-2026",
    title: "Hack The Box University CTF 2026",
    organizer: "Hack The Box",
    category: "Cybersecurity",
    mode: "Online",
    location: "Global",
    registrationDeadline: "2026-05-10",
    eventStart: "2026-05-17",
    eventEnd: "2026-05-18",
    prize: "Cash + certifications",
    level: "Advanced",
    url: "https://www.hackthebox.com/",
    tags: ["ctf", "security", "reverse engineering"],
  },
  {
    id: "hackmit-2026",
    title: "HackMIT 2026",
    organizer: "MIT",
    category: "Hackathon",
    mode: "In-person",
    location: "Cambridge, USA",
    registrationDeadline: "2026-08-20",
    eventStart: "2026-09-12",
    eventEnd: "2026-09-13",
    prize: "Sponsor prize tracks",
    level: "Intermediate",
    url: "https://hackmit.org/",
    tags: ["student", "startup", "product"],
  },
  {
    id: "devpost-global-ai-2026",
    title: "Devpost Global AI Build Challenge",
    organizer: "Devpost",
    category: "AI Challenge",
    mode: "Online",
    location: "Global",
    registrationDeadline: "2026-06-30",
    eventStart: "2026-05-20",
    eventEnd: "2026-07-15",
    prize: "Cash + cloud credits",
    level: "Intermediate",
    url: "https://devpost.com/hackathons",
    tags: ["genai", "llm", "product engineering"],
  },
  {
    id: "cloud-native-sprint-2026",
    title: "Cloud Native Build Sprint 2026",
    organizer: "CNCF Community",
    category: "Build Sprint",
    mode: "Online",
    location: "Global",
    registrationDeadline: "2026-04-05",
    eventStart: "2026-04-08",
    eventEnd: "2026-04-20",
    prize: "Community badges + spotlight",
    level: "Intermediate",
    url: "https://www.cncf.io/",
    tags: ["kubernetes", "devops", "backend"],
  },
  {
    id: "leetcode-sprint-2026",
    title: "LeetCode Weekly Contest Sprint",
    organizer: "LeetCode",
    category: "Build Sprint",
    mode: "Online",
    location: "Global",
    registrationDeadline: "2026-03-01",
    eventStart: "2026-03-02",
    eventEnd: "2026-03-30",
    prize: "Leaderboard medals",
    level: "Beginner",
    url: "https://leetcode.com/contest/",
    tags: ["dsa", "interview prep", "competitive programming"],
  },
  {
    id: "ieee-xtreme-2026",
    title: "IEEE Xtreme 18.0 Prep + Qualifier",
    organizer: "IEEE",
    category: "Build Sprint",
    mode: "Online",
    location: "Global",
    registrationDeadline: "2026-10-10",
    eventStart: "2026-10-24",
    eventEnd: "2026-10-25",
    prize: "Global rank and certificates",
    level: "Advanced",
    url: "https://xtreme.vtools.ieee.org/",
    tags: ["algorithms", "systems thinking", "team coding"],
  },
];
