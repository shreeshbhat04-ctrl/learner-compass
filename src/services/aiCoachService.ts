const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");
const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? "");
const aiApiBase = `${apiBaseUrl}/api/ai`;

export interface InsightMistakePatternInput {
  label: string;
  count: number;
}

export interface InsightRecentSessionInput {
  problemTitle: string;
  language: string;
  passedTests: number;
  totalTests: number;
  tookMs: number;
}

export interface ProfileInsightRequestInput {
  userId: string;
  name: string;
  branch: string;
  acceptanceRate: number;
  streak: number;
  solvedProblems: number;
  strongestLanguage?: string;
  focusLanguage?: string;
  topMistakes: InsightMistakePatternInput[];
  recentSessions: InsightRecentSessionInput[];
}

export interface PersonalizedProfileInsight {
  headline: string;
  conciseBio: string;
  strengths: string[];
  focusAreas: string[];
  nextAction: string;
  signature: string;
}

export interface GapAnalysisFailedCaseInput {
  testCase: number;
  statusDescription: string;
  stderr?: string;
  compileOutput?: string;
  message?: string;
}

export interface GapAnalysisRequestInput {
  userId: string;
  branch: string;
  problemTitle: string;
  language: string;
  runtimeName?: string;
  passedTests: number;
  totalTests: number;
  tookMs: number;
  failedCases: GapAnalysisFailedCaseInput[];
  topMistakes: InsightMistakePatternInput[];
}

export interface GapAnalysisResult {
  summary: string;
  rootCauses: string[];
  practicePlan: string[];
  confidence: "low" | "medium" | "high";
}

export interface HintRequestInput {
  userId: string;
  branch: string;
  problemTitle: string;
  language: string;
  runtimeName?: string;
  sourceCode: string;
  passedTests: number;
  totalTests: number;
  failedCase?: GapAnalysisFailedCaseInput;
  topMistakes: InsightMistakePatternInput[];
}

export interface HintResult {
  hint: string;
  nudges: string[];
  checklist: string[];
}

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as { error?: string; hint?: string };
    if (typeof payload.error === "string") {
      if (payload.hint) {
        return `${payload.error} (${payload.hint})`;
      }
      return payload.error;
    }
  } catch {
    // Ignore parsing errors.
  }

  return `Request failed (${response.status})`;
};

const postJson = async <TResponse>(
  path: string,
  payload: unknown,
): Promise<TResponse> => {
  const response = await fetch(`${aiApiBase}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as TResponse;
};

export const requestProfileInsight = async (
  payload: ProfileInsightRequestInput,
): Promise<PersonalizedProfileInsight> => {
  const response = await postJson<{ profile: PersonalizedProfileInsight }>(
    "/profile-insight",
    payload,
  );
  return response.profile;
};

export const requestGapAnalysis = async (
  payload: GapAnalysisRequestInput,
): Promise<GapAnalysisResult> => {
  const response = await postJson<{ analysis: GapAnalysisResult }>("/gap-analysis", payload);
  return response.analysis;
};

export const requestHint = async (payload: HintRequestInput): Promise<HintResult> => {
  const response = await postJson<{ hint: HintResult }>("/hint", payload);
  return response.hint;
};
