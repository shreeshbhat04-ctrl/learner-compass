import { safeStorage } from "@/lib/safeStorage";
import type { User } from "@/context/AuthContext";
import {
  getLearnerProfile,
  type LearnerDnaSummary,
} from "@/services/learnerProfileService";
import {
  requestProfileInsight,
  type PersonalizedProfileInsight,
} from "@/services/aiCoachService";

const INSIGHT_STORAGE_PREFIX = "learnpath_ai_insight_";
const INSIGHT_TTL_MS = 12 * 60 * 60 * 1000;

export interface StoredLearnerInsight extends PersonalizedProfileInsight {
  userId: string;
  updatedAt: string;
  source: "ai" | "fallback";
}

const storageKey = (userId: string): string => `${INSIGHT_STORAGE_PREFIX}${userId}`;

const readStored = (userId: string): StoredLearnerInsight | null => {
  const raw = safeStorage.getItem(storageKey(userId));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredLearnerInsight;
  } catch {
    return null;
  }
};

const writeStored = (value: StoredLearnerInsight): void => {
  safeStorage.setItem(storageKey(value.userId), JSON.stringify(value));
};

const isExpired = (value: StoredLearnerInsight): boolean => {
  const updatedAtMs = Date.parse(value.updatedAt);
  if (!Number.isFinite(updatedAtMs)) return true;
  return Date.now() - updatedAtMs > INSIGHT_TTL_MS;
};

const pickStrengths = (dna: LearnerDnaSummary): string[] => {
  const strengths: string[] = [];
  if (dna.strongestLanguage) {
    strengths.push(`Strong execution in ${dna.strongestLanguage.toUpperCase()}`);
  }
  if (dna.acceptanceRate >= 70) {
    strengths.push("High test-pass consistency");
  }
  if (dna.streak >= 3) {
    strengths.push(`Solid learning consistency (${dna.streak}-day streak)`);
  }
  if (strengths.length === 0) {
    strengths.push("Building consistent execution habits");
  }
  return strengths.slice(0, 3);
};

const pickFocusAreas = (dna: LearnerDnaSummary): string[] => {
  const focusAreas = dna.topMistakes.map((mistake) => mistake.label);
  if (dna.focusLanguage) {
    focusAreas.push(`Accuracy in ${dna.focusLanguage.toUpperCase()}`);
  }
  if (focusAreas.length === 0) {
    focusAreas.push("Edge-case coverage and output validation");
  }
  return focusAreas.slice(0, 3);
};

const buildFallbackInsight = (
  user: User,
  dna: LearnerDnaSummary,
): StoredLearnerInsight => {
  const now = new Date().toISOString();
  const strongest = dna.strongestLanguage?.toUpperCase() ?? "FOUNDATIONS";
  const focus = dna.focusLanguage?.toUpperCase() ?? "PROBLEM BREAKDOWN";

  return {
    userId: user.id,
    updatedAt: now,
    source: "fallback",
    headline: `${user.name}'s adaptive profile`,
    conciseBio: `You are currently strongest in ${strongest} and should now sharpen ${focus}. Keep sessions short, test-driven, and regular.`,
    strengths: pickStrengths(dna),
    focusAreas: pickFocusAreas(dna),
    nextAction: "Complete one recovery problem, then rerun with explicit edge-case checks before submission.",
    signature: `${user.branch.toUpperCase()} growth mode`,
  };
};

export const getStoredLearnerInsight = (userId: string): StoredLearnerInsight | null =>
  readStored(userId);

export const clearStoredLearnerInsight = (userId: string): void => {
  safeStorage.removeItem(storageKey(userId));
};

export const ensureLearnerInsight = async (
  user: User,
  dna: LearnerDnaSummary,
  forceRefresh = false,
): Promise<StoredLearnerInsight> => {
  const existing = readStored(user.id);
  if (existing && !forceRefresh && !isExpired(existing)) {
    return existing;
  }

  const profile = getLearnerProfile(user.id, user.branch);

  try {
    const generated = await requestProfileInsight({
      userId: user.id,
      name: user.name,
      branch: user.branch,
      acceptanceRate: dna.acceptanceRate,
      streak: dna.streak,
      solvedProblems: dna.solvedProblems,
      strongestLanguage: dna.strongestLanguage,
      focusLanguage: dna.focusLanguage,
      topMistakes: dna.topMistakes.map((mistake) => ({
        label: mistake.label,
        count: mistake.count,
      })),
      recentSessions: profile.recentSessions.slice(0, 8).map((session) => ({
        problemTitle: session.problemTitle,
        language: session.language,
        passedTests: session.passedTests,
        totalTests: session.totalTests,
        tookMs: session.tookMs,
      })),
    });

    const stored: StoredLearnerInsight = {
      userId: user.id,
      updatedAt: new Date().toISOString(),
      source: "ai",
      ...generated,
    };
    writeStored(stored);
    return stored;
  } catch {
    const fallback = buildFallbackInsight(user, dna);
    writeStored(fallback);
    return fallback;
  }
};
