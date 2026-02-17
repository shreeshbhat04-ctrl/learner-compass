const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");
const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? "");
const techNewsApiBase = `${apiBaseUrl}/api/news`;

export interface TechNewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
  score: number;
  relevance: "personalized" | "general";
  query: string;
}

export interface TechNewsRequest {
  branch?: string;
  strongestLanguage?: string;
  focusLanguage?: string;
  topMistakes?: string[];
  recentProblemTitles?: string[];
  techViseTags?: string[];
  maxPersonalized?: number;
  maxGeneral?: number;
}

export interface TechNewsResponse {
  source: "live" | "fallback";
  personalizedQueries: string[];
  generalQueries: string[];
  personalizedCount: number;
  generalCount: number;
  total: number;
  cache: "hit" | "miss";
  articles: TechNewsArticle[];
}

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as { error?: string };
    if (typeof payload.error === "string") {
      return payload.error;
    }
  } catch {
    // Ignore parsing failures.
  }

  return `Request failed (${response.status})`;
};

export const fetchTechNews = async (
  request: TechNewsRequest,
): Promise<TechNewsResponse> => {
  const response = await fetch(`${techNewsApiBase}/tech`, {
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

  return (await response.json()) as TechNewsResponse;
};
