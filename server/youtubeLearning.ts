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

export interface YouTubeLearningQuery {
  query: string;
  maxResults?: number;
  videoDuration?: "any" | "short" | "medium" | "long";
}

export interface YouTubeLearningClientOptions {
  apiUrl: string;
  apiKey: string;
  defaultMaxResults: number;
  requestTimeoutMs: number;
}

interface YouTubeSearchPayload {
  items?: Array<{
    id?: { videoId?: string };
    snippet?: {
      title?: string;
      description?: string;
      channelTitle?: string;
      publishedAt?: string;
      thumbnails?: {
        high?: { url?: string };
        medium?: { url?: string };
        default?: { url?: string };
      };
    };
  }>;
}

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const tokenize = (value: string): string[] =>
  value
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);

const toVideo = (
  item: NonNullable<YouTubeSearchPayload["items"]>[number],
): LearningVideo | null => {
  const videoId = item.id?.videoId?.trim();
  if (!videoId) return null;

  const title = item.snippet?.title?.trim() ?? "Untitled";
  const description = item.snippet?.description?.trim() ?? "";
  const channelTitle = item.snippet?.channelTitle?.trim() ?? "Unknown channel";
  const thumbnailUrl =
    item.snippet?.thumbnails?.high?.url ??
    item.snippet?.thumbnails?.medium?.url ??
    item.snippet?.thumbnails?.default?.url ??
    "";
  const publishedAt = item.snippet?.publishedAt ?? "";

  return {
    videoId,
    title,
    description: description.length > 280 ? `${description.slice(0, 280)}...` : description,
    channelTitle,
    thumbnailUrl,
    publishedAt,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
  };
};

const scoreVideo = (video: LearningVideo, queryTokens: string[]): number => {
  const title = video.title.toLowerCase();
  const description = video.description.toLowerCase();
  const channel = video.channelTitle.toLowerCase();

  let score = 0;
  for (const token of queryTokens) {
    if (title.includes(token)) score += 8;
    if (description.includes(token)) score += 3;
    if (channel.includes(token)) score += 2;
  }

  if (/(tutorial|course|full course|hands-on|project|interview|dsa|system design)/.test(title)) {
    score += 6;
  }

  return score;
};

export class YouTubeLearningClient {
  private readonly apiBaseUrl: string;

  constructor(private readonly options: YouTubeLearningClientOptions) {
    this.apiBaseUrl = trimTrailingSlash(options.apiUrl);
  }

  async searchVideos(query: YouTubeLearningQuery): Promise<LearningVideo[]> {
    const maxResults = Math.min(
      12,
      Math.max(1, query.maxResults ?? this.options.defaultMaxResults),
    );
    const queryTokens = tokenize(query.query);

    const params = new URLSearchParams({
      part: "snippet",
      type: "video",
      maxResults: String(Math.min(25, Math.max(8, maxResults * 2))),
      safeSearch: "strict",
      order: "relevance",
      relevanceLanguage: "en",
      videoEmbeddable: "true",
      videoCategoryId: "27",
      videoDuration: query.videoDuration ?? "medium",
      q: query.query,
      key: this.options.apiKey,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.requestTimeoutMs);

    try {
      const response = await fetch(`${this.apiBaseUrl}/search?${params.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const responseText = await response.text().catch(() => "");
        throw new Error(`YouTube API request failed (${response.status}): ${responseText}`);
      }

      const payload = (await response.json()) as YouTubeSearchPayload;
      const videos = (payload.items ?? [])
        .map((item) => toVideo(item))
        .filter((item): item is LearningVideo => Boolean(item));

      const seen = new Set<string>();
      const deduped = videos.filter((video) => {
        if (seen.has(video.videoId)) return false;
        seen.add(video.videoId);
        return true;
      });

      return deduped
        .map((video, index) => ({
          video,
          score: scoreVideo(video, queryTokens),
          originalIndex: index,
        }))
        .sort((left, right) => {
          if (right.score !== left.score) return right.score - left.score;
          return left.originalIndex - right.originalIndex;
        })
        .slice(0, maxResults)
        .map((entry) => entry.video);
    } finally {
      clearTimeout(timeout);
    }
  }
}
