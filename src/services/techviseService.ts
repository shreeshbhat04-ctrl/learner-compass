import { safeStorage } from "@/lib/safeStorage";
import { getLearnerDnaSummary } from "@/services/learnerProfileService";

const TECHVISE_STORAGE_KEY = "learnpath_techvise_state_v1";

export interface TechViseUser {
  id: string;
  name: string;
  branch: string;
}

export interface TechViseAuthor {
  id: string;
  name: string;
  company?: string;
  role?: string;
  isCompanyEngineer: boolean;
}

export interface TechViseAnswer {
  id: string;
  body: string;
  createdAt: string;
  author: TechViseAuthor;
  upvotes: number;
  downvotes: number;
}

export interface TechViseThread {
  id: string;
  title: string;
  body: string;
  tags: string[];
  companyFocus?: string;
  createdAt: string;
  updatedAt: string;
  author: TechViseAuthor;
  answers: TechViseAnswer[];
}

export interface TechViseLeaderboardEntry {
  id: string;
  name: string;
  company?: string;
  role?: string;
  isCompanyEngineer: boolean;
  totalQuestions: number;
  totalAnswers: number;
  helpfulVotes: number;
  upvotesReceived: number;
  downvotesReceived: number;
  solvedProblems: number;
  acceptanceRate: number;
  streak: number;
  score: number;
  badge: string;
}

export interface TechViseUserStats {
  userId: string;
  questionsAsked: number;
  answersGiven: number;
  upvotesReceived: number;
  downvotesReceived: number;
  helpfulVotes: number;
}

interface TechViseState {
  threads: TechViseThread[];
  votesByUser: Record<string, 1 | -1>;
}

const seededContributorStats: Record<
  string,
  { solvedProblems: number; acceptanceRate: number; streak: number }
> = {
  eng_google_arjun: { solvedProblems: 412, acceptanceRate: 86, streak: 48 },
  eng_amazon_naina: { solvedProblems: 365, acceptanceRate: 82, streak: 35 },
  eng_meta_joel: { solvedProblems: 388, acceptanceRate: 84, streak: 41 },
  eng_nvidia_riya: { solvedProblems: 344, acceptanceRate: 79, streak: 29 },
};

const toThreadId = (): string => `thread_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const toAnswerId = (): string => `answer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const normalizeTags = (tags: string[]): string[] =>
  tags
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 1)
    .slice(0, 8);

const sortThreads = (threads: TechViseThread[]): TechViseThread[] =>
  threads
    .slice()
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

const defaultState = (): TechViseState => {
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;
  const asIso = (offsetDays: number): string => new Date(now.getTime() - offsetDays * day).toISOString();

  const threads: TechViseThread[] = [
    {
      id: "thread_google_sde",
      title: "How to stand out for Google SDE internship?",
      body:
        "I can solve medium DSA problems but still freeze in interviews. What exact routine helped you crack Google internships?",
      tags: ["google", "internship", "dsa", "interview"],
      companyFocus: "Google",
      createdAt: asIso(6),
      updatedAt: asIso(2),
      author: {
        id: "student_aarav",
        name: "Aarav S.",
        isCompanyEngineer: false,
      },
      answers: [
        {
          id: "ans_google_1",
          body:
            "Track your error patterns after every mock round. I used a sheet with columns: missed edge case, wrong data structure, and time pressure mistakes. That improved consistency faster than random practice.",
          createdAt: asIso(5),
          author: {
            id: "eng_google_arjun",
            name: "Arjun M.",
            company: "Google",
            role: "Software Engineer II",
            isCompanyEngineer: true,
          },
          upvotes: 24,
          downvotes: 1,
        },
        {
          id: "ans_google_2",
          body:
            "I split my week into 3 coding days + 2 mock interview days. On mock days, I only solved unseen questions with a timer and verbalized tradeoffs.",
          createdAt: asIso(3),
          author: {
            id: "eng_meta_joel",
            name: "Joel D.",
            company: "Meta",
            role: "Senior Software Engineer",
            isCompanyEngineer: true,
          },
          upvotes: 18,
          downvotes: 0,
        },
      ],
    },
    {
      id: "thread_amazon_lp",
      title: "Amazon LP answers: how detailed should they be?",
      body:
        "I have stories, but I either over-explain or sound too generic. How should I structure LP responses for internship and FTE?",
      tags: ["amazon", "lp", "behavioral", "fte"],
      companyFocus: "Amazon",
      createdAt: asIso(4),
      updatedAt: asIso(1),
      author: {
        id: "student_ishita",
        name: "Ishita P.",
        isCompanyEngineer: false,
      },
      answers: [
        {
          id: "ans_amazon_1",
          body:
            "Use STAR in under 2 minutes: context (15 sec), action (60 sec), result (30 sec), reflection (15 sec). Reflection is where most candidates miss out.",
          createdAt: asIso(3),
          author: {
            id: "eng_amazon_naina",
            name: "Naina R.",
            company: "Amazon",
            role: "SDE II",
            isCompanyEngineer: true,
          },
          upvotes: 21,
          downvotes: 2,
        },
      ],
    },
    {
      id: "thread_nvidia_systems",
      title: "NVIDIA intern prep for systems and performance roles",
      body:
        "I’m from ECE and want systems internship roles. Which projects make the biggest difference for NVIDIA applications?",
      tags: ["nvidia", "ece", "systems", "performance"],
      companyFocus: "NVIDIA",
      createdAt: asIso(3),
      updatedAt: asIso(1),
      author: {
        id: "student_karthik",
        name: "Karthik B.",
        isCompanyEngineer: false,
      },
      answers: [
        {
          id: "ans_nvidia_1",
          body:
            "Build one measurable optimization project. Example: baseline vs optimized pipeline with latency/throughput comparison and clear profiling evidence.",
          createdAt: asIso(2),
          author: {
            id: "eng_nvidia_riya",
            name: "Riya T.",
            company: "NVIDIA",
            role: "GPU Software Engineer",
            isCompanyEngineer: true,
          },
          upvotes: 19,
          downvotes: 0,
        },
      ],
    },
  ];

  return {
    threads,
    votesByUser: {},
  };
};

const readState = (): TechViseState => {
  const raw = safeStorage.getItem(TECHVISE_STORAGE_KEY);
  if (!raw) return defaultState();

  try {
    const parsed = JSON.parse(raw) as TechViseState;
    if (!Array.isArray(parsed.threads) || typeof parsed.votesByUser !== "object") {
      return defaultState();
    }
    return {
      threads: parsed.threads,
      votesByUser: parsed.votesByUser,
    };
  } catch {
    return defaultState();
  }
};

const writeState = (state: TechViseState): void => {
  safeStorage.setItem(TECHVISE_STORAGE_KEY, JSON.stringify(state));
};

const badgeForScore = (score: number): string => {
  if (score >= 800) return "Principal Mentor";
  if (score >= 500) return "Senior Mentor";
  if (score >= 300) return "Trusted Advisor";
  if (score >= 150) return "Rising Guide";
  return "Contributor";
};

export const getTechViseUserStats = (userId: string): TechViseUserStats => {
  const threads = listTechViseThreads();
  let questionsAsked = 0;
  let answersGiven = 0;
  let upvotesReceived = 0;
  let downvotesReceived = 0;

  for (const thread of threads) {
    if (thread.author.id === userId) {
      questionsAsked += 1;
    }

    for (const answer of thread.answers) {
      if (answer.author.id !== userId) continue;
      answersGiven += 1;
      upvotesReceived += answer.upvotes;
      downvotesReceived += answer.downvotes;
    }
  }

  return {
    userId,
    questionsAsked,
    answersGiven,
    upvotesReceived,
    downvotesReceived,
    helpfulVotes: upvotesReceived - downvotesReceived,
  };
};

export const listTechViseThreads = (): TechViseThread[] => {
  const state = readState();
  return sortThreads(state.threads);
};

export const createTechViseThread = ({
  title,
  body,
  tags,
  companyFocus,
  user,
}: {
  title: string;
  body: string;
  tags: string[];
  companyFocus?: string;
  user: TechViseUser;
}): TechViseThread => {
  const state = readState();
  const now = new Date().toISOString();

  const thread: TechViseThread = {
    id: toThreadId(),
    title: title.trim(),
    body: body.trim(),
    tags: normalizeTags(tags),
    companyFocus: companyFocus?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    author: {
      id: user.id,
      name: user.name,
      isCompanyEngineer: false,
    },
    answers: [],
  };

  state.threads.unshift(thread);
  writeState(state);
  return thread;
};

export const addTechViseAnswer = ({
  threadId,
  body,
  user,
  isCompanyEngineer,
  company,
  role,
}: {
  threadId: string;
  body: string;
  user: TechViseUser;
  isCompanyEngineer: boolean;
  company?: string;
  role?: string;
}): TechViseThread | null => {
  const state = readState();
  const now = new Date().toISOString();
  const thread = state.threads.find((item) => item.id === threadId);
  if (!thread) return null;

  thread.answers.push({
    id: toAnswerId(),
    body: body.trim(),
    createdAt: now,
    author: {
      id: user.id,
      name: user.name,
      company: isCompanyEngineer ? company?.trim() || undefined : undefined,
      role: isCompanyEngineer ? role?.trim() || undefined : undefined,
      isCompanyEngineer,
    },
    upvotes: 0,
    downvotes: 0,
  });

  thread.updatedAt = now;
  writeState(state);
  return thread;
};

export const voteTechViseAnswer = ({
  threadId,
  answerId,
  userId,
  value,
}: {
  threadId: string;
  answerId: string;
  userId: string;
  value: 1 | -1;
}): TechViseThread | null => {
  const state = readState();
  const thread = state.threads.find((item) => item.id === threadId);
  if (!thread) return null;
  const answer = thread.answers.find((item) => item.id === answerId);
  if (!answer) return null;

  const voteKey = `${userId}:${threadId}:${answerId}`;
  const previous = state.votesByUser[voteKey];

  if (previous === value) {
    if (value === 1 && answer.upvotes > 0) answer.upvotes -= 1;
    if (value === -1 && answer.downvotes > 0) answer.downvotes -= 1;
    delete state.votesByUser[voteKey];
    thread.updatedAt = new Date().toISOString();
    writeState(state);
    return thread;
  }

  if (previous === 1 && answer.upvotes > 0) {
    answer.upvotes -= 1;
  } else if (previous === -1 && answer.downvotes > 0) {
    answer.downvotes -= 1;
  }

  if (value === 1) {
    answer.upvotes += 1;
  } else {
    answer.downvotes += 1;
  }

  state.votesByUser[voteKey] = value;
  thread.updatedAt = new Date().toISOString();
  writeState(state);
  return thread;
};

export const getCompanyTechAdvice = (company: string, limit = 6): TechViseAnswer[] => {
  const target = company.toLowerCase().trim();
  if (!target) return [];

  const threads = listTechViseThreads();
  return threads
    .flatMap((thread) => thread.answers)
    .filter((answer) => answer.author.company?.toLowerCase() === target)
    .sort((left, right) => {
      const scoreDelta = right.upvotes - right.downvotes - (left.upvotes - left.downvotes);
      if (scoreDelta !== 0) return scoreDelta;
      return right.createdAt.localeCompare(left.createdAt);
    })
    .slice(0, Math.max(1, limit));
};

export const getTechViseLeaderboard = (
  currentUser?: TechViseUser,
): TechViseLeaderboardEntry[] => {
  const threads = listTechViseThreads();
  const board = new Map<string, TechViseLeaderboardEntry>();

  const ensureEntry = (author: TechViseAuthor): TechViseLeaderboardEntry => {
    const existing = board.get(author.id);
    if (existing) return existing;

    const profileStats = seededContributorStats[author.id] ?? {
      solvedProblems: 0,
      acceptanceRate: 0,
      streak: 0,
    };

    const created: TechViseLeaderboardEntry = {
      id: author.id,
      name: author.name,
      company: author.company,
      role: author.role,
      isCompanyEngineer: author.isCompanyEngineer,
      totalQuestions: 0,
      totalAnswers: 0,
      helpfulVotes: 0,
      upvotesReceived: 0,
      downvotesReceived: 0,
      solvedProblems: profileStats.solvedProblems,
      acceptanceRate: profileStats.acceptanceRate,
      streak: profileStats.streak,
      score: 0,
      badge: "Contributor",
    };
    board.set(author.id, created);
    return created;
  };

  for (const thread of threads) {
    const questionEntry = ensureEntry(thread.author);
    questionEntry.totalQuestions += 1;

    for (const answer of thread.answers) {
      const entry = ensureEntry(answer.author);
      entry.totalAnswers += 1;
      entry.upvotesReceived += answer.upvotes;
      entry.downvotesReceived += answer.downvotes;
      entry.helpfulVotes += answer.upvotes - answer.downvotes;
      if (!entry.company && answer.author.company) {
        entry.company = answer.author.company;
      }
      if (!entry.role && answer.author.role) {
        entry.role = answer.author.role;
      }
      if (!entry.isCompanyEngineer && answer.author.isCompanyEngineer) {
        entry.isCompanyEngineer = true;
      }
    }
  }

  if (currentUser) {
    const current = board.get(currentUser.id) ?? {
      id: currentUser.id,
      name: currentUser.name,
      isCompanyEngineer: false,
      totalQuestions: 0,
      totalAnswers: 0,
      helpfulVotes: 0,
      upvotesReceived: 0,
      downvotesReceived: 0,
      solvedProblems: 0,
      acceptanceRate: 0,
      streak: 0,
      score: 0,
      badge: "Contributor",
    };

    const dna = getLearnerDnaSummary(currentUser.id, currentUser.branch);
    current.solvedProblems = dna.solvedProblems;
    current.acceptanceRate = dna.acceptanceRate;
    current.streak = dna.streak;
    board.set(currentUser.id, current);
  }

  const entries = Array.from(board.values()).map((entry) => {
    const score = Math.round(
      entry.totalQuestions * 8 +
        entry.totalAnswers * 12 +
        Math.max(0, entry.helpfulVotes) * 6 +
        entry.solvedProblems * 1.2 +
        entry.acceptanceRate * 0.8 +
        entry.streak * 2 +
        (entry.isCompanyEngineer ? 25 : 0),
    );

    return {
      ...entry,
      score,
      badge: badgeForScore(score),
    };
  });

  return entries.sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    if (right.helpfulVotes !== left.helpfulVotes) return right.helpfulVotes - left.helpfulVotes;
    return right.totalAnswers - left.totalAnswers;
  });
};
