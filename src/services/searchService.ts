import { tracks } from "@/data/tracks";
import {
  CatalogSearchEngine,
  type SearchHit,
  type SearchOptions,
  type SearchRequestType,
} from "@/shared/catalogSearch";

interface SearchApiPayload {
  query: string;
  tookMs: number;
  total: number;
  results: SearchHit[];
  cache: "hit" | "miss";
}

export interface SearchResponse {
  query: string;
  tookMs: number;
  total: number;
  results: SearchHit[];
  source: "api" | "fallback";
}

export interface SearchRequest {
  q: string;
  type?: SearchRequestType;
  branch?: string;
  limit?: number;
  signal?: AbortSignal;
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? "");
const searchEndpoint = `${apiBaseUrl}/api/search`;

let fallbackEngine: CatalogSearchEngine | null = null;

const getFallbackEngine = () => {
  if (!fallbackEngine) {
    fallbackEngine = new CatalogSearchEngine(tracks);
  }
  return fallbackEngine;
};

const mapRequestToOptions = (request: SearchRequest): SearchOptions => ({
  type: request.type,
  branch: request.branch,
  limit: request.limit,
});

export const searchCatalog = async (request: SearchRequest): Promise<SearchResponse> => {
  const trimmedQuery = request.q.trim();
  if (!trimmedQuery) {
    return {
      query: "",
      tookMs: 0,
      total: 0,
      results: [],
      source: "api",
    };
  }

  const params = new URLSearchParams({
    q: trimmedQuery,
  });

  if (request.type && request.type !== "all") {
    params.set("type", request.type);
  }
  if (request.branch) {
    params.set("branch", request.branch);
  }
  if (request.limit) {
    params.set("limit", String(request.limit));
  }

  try {
    const response = await fetch(`${searchEndpoint}?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: request.signal,
    });

    if (!response.ok) {
      throw new Error(`Search API failed with status ${response.status}`);
    }

    const payload = (await response.json()) as SearchApiPayload;
    return {
      query: payload.query,
      tookMs: payload.tookMs,
      total: payload.total,
      results: payload.results,
      source: "api",
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    const startedAt = Date.now();
    const fallbackResult = getFallbackEngine().search(trimmedQuery, mapRequestToOptions(request));
    return {
      query: trimmedQuery,
      tookMs: Date.now() - startedAt,
      total: fallbackResult.total,
      results: fallbackResult.results,
      source: "fallback",
    };
  }
};
