import type { LearningVideo } from "./youtubeLearning";

interface FallbackVideoSeed {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  tags: string[];
}

interface RankedFallbackVideo extends LearningVideo {
  tags: string[];
}

export interface FallbackVideoRequest {
  query?: string;
  branch?: string;
  courseTitle?: string;
  trackTitle?: string;
  level?: string;
  focusLanguage?: string;
  focusAreas?: string[];
  maxResults: number;
}

const fallbackSeeds: FallbackVideoSeed[] = [
  {
    videoId: "rfscVS0vtbw",
    title: "Python for Beginners - Full Course",
    description: "Beginner-friendly full Python course with projects and exercises.",
    channelTitle: "freeCodeCamp.org",
    tags: ["python", "beginner", "full course", "coding", "problem solving"],
  },
  {
    videoId: "W6NZfCO5SIk",
    title: "JavaScript Tutorial for Beginners",
    description: "Core JavaScript concepts, syntax, and practical coding examples.",
    channelTitle: "Programming with Mosh",
    tags: ["javascript", "beginner", "web", "frontend", "coding"],
  },
  {
    videoId: "8hly31xKli0",
    title: "Data Structures and Algorithms Course",
    description: "Full DSA walkthrough with complexity and implementation details.",
    channelTitle: "freeCodeCamp.org",
    tags: ["dsa", "algorithms", "interview", "problem solving", "coding"],
  },
  {
    videoId: "RBSGKlAvoiM",
    title: "Data Structures Easy to Advanced Course",
    description: "Step-by-step structures and algorithmic patterns.",
    channelTitle: "freeCodeCamp.org",
    tags: ["dsa", "advanced", "arrays", "trees", "graphs", "coding"],
  },
  {
    videoId: "HXV3zeQKqGY",
    title: "SQL Tutorial - Full Database Course",
    description: "Comprehensive SQL learning path from basics to joins and grouping.",
    channelTitle: "freeCodeCamp.org",
    tags: ["sql", "database", "queries", "backend", "data"],
  },
  {
    videoId: "Oe421EPjeBE",
    title: "Node.js and Express.js - Full Course",
    description: "Backend API building with Node and Express from scratch.",
    channelTitle: "freeCodeCamp.org",
    tags: ["node", "express", "backend", "api", "javascript"],
  },
  {
    videoId: "dFgzHOX84xQ",
    title: "Tailwind CSS Crash Course",
    description: "Rapid modern UI styling with utility-first Tailwind CSS.",
    channelTitle: "Traversy Media",
    tags: ["tailwind", "css", "frontend", "ui", "web"],
  },
  {
    videoId: "bMknfKXIFA8",
    title: "React Course - Beginner's Tutorial",
    description: "React fundamentals, components, hooks, and project workflow.",
    channelTitle: "freeCodeCamp.org",
    tags: ["react", "frontend", "javascript", "hooks", "web"],
  },
  {
    videoId: "fqMOX6JJhGo",
    title: "Docker Tutorial for Beginners",
    description: "Containers, images, compose, and deployment basics.",
    channelTitle: "TechWorld with Nana",
    tags: ["docker", "devops", "deployment", "cloud", "backend"],
  },
  {
    videoId: "X48VuDVv0do",
    title: "Kubernetes Course for Beginners",
    description: "Kubernetes architecture, workloads, and cluster basics.",
    channelTitle: "freeCodeCamp.org",
    tags: ["kubernetes", "devops", "cloud", "scaling", "deployment"],
  },
  {
    videoId: "MbjObHmDbZo",
    title: "System Design Interview Course",
    description: "Scalable architecture fundamentals and interview strategies.",
    channelTitle: "freeCodeCamp.org",
    tags: ["system design", "scaling", "architecture", "interview", "backend"],
  },
  {
    videoId: "30LWjhZzg50",
    title: "TypeScript Course for Beginners",
    description: "Type-safe JavaScript development for modern applications.",
    channelTitle: "freeCodeCamp.org",
    tags: ["typescript", "javascript", "frontend", "backend", "coding"],
  },
  {
    videoId: "vLnPwxZdW4Y",
    title: "C++ Tutorial for Beginners",
    description: "C++ fundamentals and coding logic for students and interview prep.",
    channelTitle: "Programming with Mosh",
    tags: ["c++", "beginner", "algorithms", "coding", "interview"],
  },
  {
    videoId: "eIrMbAQSU34",
    title: "Java Tutorial for Beginners",
    description: "Java fundamentals, classes, OOP, and practical coding.",
    channelTitle: "Programming with Mosh",
    tags: ["java", "oop", "beginner", "backend", "coding"],
  },
  {
    videoId: "BpPEoZW5IiY",
    title: "Rust Programming Course for Beginners",
    description: "Ownership, borrowing, and writing safe systems code.",
    channelTitle: "freeCodeCamp.org",
    tags: ["rust", "systems", "backend", "coding", "advanced"],
  },
  {
    videoId: "YS4e4q9oBaU",
    title: "Go Programming Language Crash Course",
    description: "Go basics and backend service-friendly coding patterns.",
    channelTitle: "Traversy Media",
    tags: ["go", "backend", "concurrency", "api", "coding"],
  },
  {
    videoId: "i_LwzRVP7bg",
    title: "Machine Learning for Everybody",
    description: "Core ML concepts for beginners using practical examples.",
    channelTitle: "freeCodeCamp.org",
    tags: ["machine learning", "data science", "python", "ai", "beginner"],
  },
  {
    videoId: "pQN-pnXPaVg",
    title: "HTML Full Course - Build a Website Tutorial",
    description: "HTML foundations and semantic structure for web development.",
    channelTitle: "freeCodeCamp.org",
    tags: ["html", "web", "frontend", "beginner", "ui"],
  },
  {
    videoId: "yfoY53QXEnI",
    title: "CSS Crash Course for Absolute Beginners",
    description: "Learn CSS quickly with practical web UI examples.",
    channelTitle: "Traversy Media",
    tags: ["css", "frontend", "web", "beginner", "ui"],
  },
  {
    videoId: "RGOj5yH7evk",
    title: "Git and GitHub for Beginners",
    description: "Version control essentials and practical team workflows.",
    channelTitle: "freeCodeCamp.org",
    tags: ["git", "github", "workflow", "collaboration", "dev"],
  },
];

const toTokens = (value: string): string[] =>
  value
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);

const normalizeSeed = (seed: FallbackVideoSeed): RankedFallbackVideo => ({
  videoId: seed.videoId,
  title: seed.title,
  description: seed.description,
  channelTitle: seed.channelTitle,
  thumbnailUrl: `https://i.ytimg.com/vi/${seed.videoId}/hqdefault.jpg`,
  publishedAt: "",
  watchUrl: `https://www.youtube.com/watch?v=${seed.videoId}`,
  embedUrl: `https://www.youtube.com/embed/${seed.videoId}?rel=0&modestbranding=1`,
  tags: seed.tags.map((tag) => tag.toLowerCase()),
});

const fallbackCatalog = fallbackSeeds.map((seed) => normalizeSeed(seed));

const scoreFallback = (video: RankedFallbackVideo, tokens: string[]): number => {
  const title = video.title.toLowerCase();
  const description = video.description.toLowerCase();
  const channel = video.channelTitle.toLowerCase();

  let score = 0;
  for (const token of tokens) {
    if (video.tags.some((tag) => tag.includes(token))) score += 8;
    if (title.includes(token)) score += 6;
    if (description.includes(token)) score += 3;
    if (channel.includes(token)) score += 1;
  }

  return score;
};

export const getFallbackLearningVideos = (request: FallbackVideoRequest): LearningVideo[] => {
  const tokens = Array.from(
    new Set(
      [
        ...(request.query ? toTokens(request.query) : []),
        ...(request.branch ? toTokens(request.branch) : []),
        ...(request.courseTitle ? toTokens(request.courseTitle) : []),
        ...(request.trackTitle ? toTokens(request.trackTitle) : []),
        ...(request.level ? toTokens(request.level) : []),
        ...(request.focusLanguage ? toTokens(request.focusLanguage) : []),
        ...(request.focusAreas ?? []).flatMap((area) => toTokens(area)),
      ],
    ),
  );

  const ranked = fallbackCatalog
    .map((video, index) => ({
      video,
      score: scoreFallback(video, tokens),
      index,
    }))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.index - right.index;
    })
    .map((entry) => entry.video);

  return ranked.slice(0, Math.max(1, Math.min(12, request.maxResults)));
};
