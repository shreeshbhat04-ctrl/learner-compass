const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");
const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? "");
const learningApiBase = `${apiBaseUrl}/api/learning`;

export interface LearningVideo {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
  watchUrl: string;
  embedUrl: string;
}

export interface PersonalizedVideoRequest {
  query?: string;
  branch?: string;
  courseTitle?: string;
  trackTitle?: string;
  level?: string;
  focusLanguage?: string;
  focusAreas?: string[];
  maxResults?: number;
}

interface PersonalizedVideoResponse {
  query: string;
  queriesUsed?: string[];
  source?: "youtube" | "fallback";
  total: number;
  videos: LearningVideo[];
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

export const fetchPersonalizedVideos = async (
  request: PersonalizedVideoRequest,
): Promise<PersonalizedVideoResponse> => {
  const response = await fetch(`${learningApiBase}/videos`, {
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

  return (await response.json()) as PersonalizedVideoResponse;
};
