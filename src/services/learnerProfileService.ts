import type { ExecuteTestResult } from "@/services/codeExecutionService";
import { safeStorage } from "@/lib/safeStorage";

const PROFILE_STORAGE_PREFIX = "learnpath_learner_profile_";
const MAX_MISTAKE_PATTERNS = 12;
const MAX_RECENT_SESSIONS = 25;

export interface LanguagePerformance {
  language: string;
  attempts: number;
  perfectRuns: number;
  totalTests: number;
  passedTests: number;
  averageRuntimeMs: number;
  lastUsedAt: string;
}

export interface MistakePattern {
  key: string;
  label: string;
  count: number;
  lastSeenAt: string;
}

export interface PracticeSessionSnapshot {
  problemId: string;
  problemTitle: string;
  topicId?: string;
  topicTitle?: string;
  language: string;
  passedTests: number;
  totalTests: number;
  tookMs: number;
  createdAt: string;
}

export interface LearnerProfile {
  userId: string;
  branch: string;
  createdAt: string;
  updatedAt: string;
  lastActiveDate?: string;
  streak: number;
  totalRuns: number;
  solvedProblems: string[];
  languagePerformance: Record<string, LanguagePerformance>;
  mistakePatterns: MistakePattern[];
  recentSessions: PracticeSessionSnapshot[];
}

export interface PracticeExecutionEvent {
  branch: string;
  problemId: string;
  problemTitle: string;
  topicId?: string;
  topicTitle?: string;
  language: string;
  results: ExecuteTestResult[];
  passedTests: number;
  totalTests: number;
  tookMs: number;
  createdAt?: string;
}

export interface LearnerDnaSummary {
  streak: number;
  totalRuns: number;
  solvedProblems: number;
  acceptanceRate: number;
  strongestLanguage?: string;
  focusLanguage?: string;
  topMistakes: MistakePattern[];
}

const normalizeLanguage = (value: string): string => value.toLowerCase().trim();
const storageKey = (userId: string): string => `${PROFILE_STORAGE_PREFIX}${userId}`;
const getDateKey = (date: Date): string => date.toISOString().slice(0, 10);

const yesterdayDateKey = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return getDateKey(date);
};

const safeReadProfile = (userId: string): LearnerProfile | null => {
  const rawValue = safeStorage.getItem(storageKey(userId));
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as LearnerProfile;
  } catch {
    return null;
  }
};

const writeProfile = (profile: LearnerProfile): void => {
  safeStorage.setItem(storageKey(profile.userId), JSON.stringify(profile));
};

const emptyProfile = (userId: string, branch: string): LearnerProfile => {
  const now = new Date().toISOString();
  return {
    userId,
    branch,
    createdAt: now,
    updatedAt: now,
    streak: 0,
    totalRuns: 0,
    solvedProblems: [],
    languagePerformance: {},
    mistakePatterns: [],
    recentSessions: [],
  };
};

const ensureLanguagePerformance = (
  profile: LearnerProfile,
  language: string,
  createdAt: string,
): LanguagePerformance => {
  const normalizedLanguage = normalizeLanguage(language);
  const existing = profile.languagePerformance[normalizedLanguage];
  if (existing) return existing;

  const created: LanguagePerformance = {
    language: normalizedLanguage,
    attempts: 0,
    perfectRuns: 0,
    totalTests: 0,
    passedTests: 0,
    averageRuntimeMs: 0,
    lastUsedAt: createdAt,
  };
  profile.languagePerformance[normalizedLanguage] = created;
  return created;
};

const updateStreak = (profile: LearnerProfile, currentDateKey: string): void => {
  if (profile.lastActiveDate === currentDateKey) return;

  if (profile.lastActiveDate === yesterdayDateKey()) {
    profile.streak += 1;
  } else {
    profile.streak = 1;
  }

  profile.lastActiveDate = currentDateKey;
};

const patternKeyForResult = (result: ExecuteTestResult): string | null => {
  if (result.compileOutput) return "compile-error";
  if (result.statusDescription.toLowerCase().includes("wrong answer")) return "wrong-answer";
  if (result.statusDescription.toLowerCase().includes("time limit")) return "time-limit";
  if (result.statusDescription.toLowerCase().includes("runtime")) return "runtime-error";
  if (result.stderr) return "stderr-error";
  return result.passed ? null : `status-${result.statusId}`;
};

const patternLabel = (key: string): string => {
  if (key === "compile-error") return "Compile errors";
  if (key === "wrong-answer") return "Wrong answers";
  if (key === "time-limit") return "Time limits";
  if (key === "runtime-error") return "Runtime errors";
  if (key === "stderr-error") return "Runtime stderr issues";
  if (key.startsWith("status-")) return `Execution status ${key.replace("status-", "")}`;
  return key;
};

const updateMistakePatterns = (profile: LearnerProfile, results: ExecuteTestResult[], now: string): void => {
  for (const result of results) {
    if (result.passed) continue;
    const key = patternKeyForResult(result);
    if (!key) continue;

    const existing = profile.mistakePatterns.find((pattern) => pattern.key === key);
    if (existing) {
      existing.count += 1;
      existing.lastSeenAt = now;
      continue;
    }

    profile.mistakePatterns.push({
      key,
      label: patternLabel(key),
      count: 1,
      lastSeenAt: now,
    });
  }

  profile.mistakePatterns.sort((left, right) => {
    if (right.count !== left.count) return right.count - left.count;
    return right.lastSeenAt.localeCompare(left.lastSeenAt);
  });

  profile.mistakePatterns = profile.mistakePatterns.slice(0, MAX_MISTAKE_PATTERNS);
};

export const getLearnerProfile = (userId: string, branch: string): LearnerProfile => {
  const existing = safeReadProfile(userId);
  if (existing) {
    if (existing.branch !== branch) {
      existing.branch = branch;
      existing.updatedAt = new Date().toISOString();
      writeProfile(existing);
    }
    return existing;
  }

  const created = emptyProfile(userId, branch);
  writeProfile(created);
  return created;
};

export const recordPracticeExecution = (
  userId: string,
  event: PracticeExecutionEvent,
): LearnerProfile => {
  const createdAt = event.createdAt ?? new Date().toISOString();
  const profile = getLearnerProfile(userId, event.branch);
  const currentDateKey = getDateKey(new Date(createdAt));

  updateStreak(profile, currentDateKey);
  profile.totalRuns += 1;
  profile.updatedAt = createdAt;

  const languageMetrics = ensureLanguagePerformance(profile, event.language, createdAt);
  languageMetrics.attempts += 1;
  languageMetrics.totalTests += event.totalTests;
  languageMetrics.passedTests += event.passedTests;
  languageMetrics.lastUsedAt = createdAt;

  const previousRuntimeTotal = languageMetrics.averageRuntimeMs * (languageMetrics.attempts - 1);
  languageMetrics.averageRuntimeMs =
    Math.round((previousRuntimeTotal + event.tookMs) / languageMetrics.attempts);

  if (event.totalTests > 0 && event.passedTests === event.totalTests) {
    languageMetrics.perfectRuns += 1;
    if (!profile.solvedProblems.includes(event.problemId)) {
      profile.solvedProblems.push(event.problemId);
    }
  }

  updateMistakePatterns(profile, event.results, createdAt);

  profile.recentSessions.unshift({
    problemId: event.problemId,
    problemTitle: event.problemTitle,
    topicId: event.topicId,
    topicTitle: event.topicTitle,
    language: normalizeLanguage(event.language),
    passedTests: event.passedTests,
    totalTests: event.totalTests,
    tookMs: event.tookMs,
    createdAt,
  });
  profile.recentSessions = profile.recentSessions.slice(0, MAX_RECENT_SESSIONS);

  writeProfile(profile);
  return profile;
};

const languageAccuracy = (performance: LanguagePerformance): number => {
  if (performance.totalTests === 0) return 0;
  return performance.passedTests / performance.totalTests;
};

export const getLearnerDnaSummary = (userId: string, branch: string): LearnerDnaSummary => {
  const profile = getLearnerProfile(userId, branch);
  const languages = Object.values(profile.languagePerformance);
  const eligible = languages.filter((language) => language.attempts > 0);

  const strongestLanguage = eligible
    .slice()
    .sort((left, right) => {
      if (languageAccuracy(right) !== languageAccuracy(left)) {
        return languageAccuracy(right) - languageAccuracy(left);
      }
      return right.attempts - left.attempts;
    })[0]?.language;

  const focusLanguage = eligible
    .slice()
    .sort((left, right) => {
      if (languageAccuracy(left) !== languageAccuracy(right)) {
        return languageAccuracy(left) - languageAccuracy(right);
      }
      return right.attempts - left.attempts;
    })[0]?.language;

  const totalTests = eligible.reduce((sum, language) => sum + language.totalTests, 0);
  const passedTests = eligible.reduce((sum, language) => sum + language.passedTests, 0);
  const acceptanceRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return {
    streak: profile.streak,
    totalRuns: profile.totalRuns,
    solvedProblems: profile.solvedProblems.length,
    acceptanceRate,
    strongestLanguage,
    focusLanguage,
    topMistakes: profile.mistakePatterns.slice(0, 3),
  };
};
