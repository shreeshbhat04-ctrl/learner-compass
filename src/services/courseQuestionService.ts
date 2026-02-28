const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");
const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? "");
const questionApiBase = `${apiBaseUrl}/api/questions`;

export type CourseQuestionDifficulty = "Beginner" | "Intermediate" | "Advanced";
export type CourseQuestionType = "coding" | "concept";

export interface CourseQuestion {
  id: string;
  title: string;
  summary: string;
  source: "codeforces" | "stackexchange" | "fallback";
  sourceLabel: string;
  url: string;
  difficulty: CourseQuestionDifficulty;
  tags: string[];
  type: CourseQuestionType;
  languageHints: string[];
}

export interface CourseQuestionRequest {
  branch?: string;
  trackId?: string;
  trackTitle?: string;
  courseId?: string;
  courseTitle?: string;
  keywords?: string[];
  limit?: number;
}

export interface CourseQuestionResponse {
  query: string;
  source: "aggregated" | "fallback";
  sources: string[];
  total: number;
  results: CourseQuestion[];
}

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as { error?: string; hint?: string };
    if (typeof payload.error === "string") {
      if (payload.hint) return `${payload.error} (${payload.hint})`;
      return payload.error;
    }
  } catch {
    // Ignore parsing errors.
  }

  return `Request failed (${response.status})`;
};

export const fetchCourseQuestions = async (
  request: CourseQuestionRequest,
): Promise<CourseQuestionResponse> => {
  const response = await fetch(`${questionApiBase}/recommendations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as CourseQuestionResponse;
};
