const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");
const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? "");
const techNewsApiBase = `${apiBaseUrl}/api/news`;
let preferLocalFallback = false;

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

const fallbackArticles: TechNewsArticle[] = [
  {
    id: "fallback-ai-platform",
    title: "AI platform engineering is reshaping developer workflows",
    url: "https://news.ycombinator.com/",
    source: "Hacker News",
    publishedAt: new Date().toISOString(),
    summary: "Teams are standardizing AI-assisted coding review and observability pipelines.",
    score: 82,
    relevance: "personalized",
    query: "ai platform engineering",
  },
  {
    id: "fallback-cloud-cost",
    title: "Cloud cost optimization becomes core to backend design",
    url: "https://news.ycombinator.com/",
    source: "Hacker News",
    publishedAt: new Date().toISOString(),
    summary: "Engineering organizations are prioritizing profiling and autoscaling safeguards.",
    score: 78,
    relevance: "personalized",
    query: "cloud optimization",
  },
  {
    id: "fallback-security",
    title: "Security-first architecture patterns gain momentum",
    url: "https://news.ycombinator.com/",
    source: "Hacker News",
    publishedAt: new Date().toISOString(),
    summary: "Modern API and service boundaries now embed zero-trust principles by default.",
    score: 74,
    relevance: "general",
    query: "cybersecurity architecture",
  },
  {
    id: "fallback-open-source",
    title: "Open source developer tools continue rapid iteration",
    url: "https://news.ycombinator.com/",
    source: "Hacker News",
    publishedAt: new Date().toISOString(),
    summary: "Community-driven tooling updates are accelerating CI/CD and testing loops.",
    score: 71,
    relevance: "general",
    query: "developer tools",
  },
];

const buildFallbackResponse = (): TechNewsResponse => {
  const personalized = fallbackArticles.filter((item) => item.relevance === "personalized");
  const general = fallbackArticles.filter((item) => item.relevance === "general");
  return {
    source: "fallback",
    personalizedQueries: personalized.map((item) => item.query),
    generalQueries: general.map((item) => item.query),
    personalizedCount: personalized.length,
    generalCount: general.length,
    total: fallbackArticles.length,
    cache: "miss",
    articles: fallbackArticles,
  };
};

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
  if (preferLocalFallback) {
    return buildFallbackResponse();
  }

  try {
    const response = await fetch(`${techNewsApiBase}/tech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status >= 500) {
        preferLocalFallback = true;
        return buildFallbackResponse();
      }
      throw new Error(await parseErrorMessage(response));
    }

    try {
      return (await response.json()) as TechNewsResponse;
    } catch {
      preferLocalFallback = true;
      return buildFallbackResponse();
    }
  } catch {
    preferLocalFallback = true;
    return buildFallbackResponse();
  }
};
