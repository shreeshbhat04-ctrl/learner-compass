const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");
const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? "");
const knowledgeGraphApiBase = `${apiBaseUrl}/api/graph`;

export interface KnowledgeGraphMistake {
  label: string;
  count: number;
}

export interface KnowledgeGraphRecentSession {
  problemId?: string;
  problemTitle: string;
  topicId?: string;
  topicTitle?: string;
  language: string;
  passedTests: number;
  totalTests: number;
  tookMs: number;
}

export interface LearningKnowledgeGraphRequest {
  userId: string;
  name: string;
  branch: string;
  strongestLanguage?: string;
  focusLanguage?: string;
  topMistakes: KnowledgeGraphMistake[];
  recentSessions: KnowledgeGraphRecentSession[];
  techViseTags: string[];
  targetCompanies: string[];
  solvedProblems?: number;
  totalRuns?: number;
  acceptanceRate?: number;
}

export interface LearningKnowledgeGraphNode {
  id: string;
  type: "learner" | "branch" | "language" | "problem" | "topic" | "mistake" | "tech-tag" | "company";
  label: string;
  weight: number;
}

export interface LearningKnowledgeGraphEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
}

export interface LearningKnowledgeGraphResponse {
  generatedAt: string;
  summary: {
    nodeCount: number;
    edgeCount: number;
    sessionCount: number;
  };
  nodes: LearningKnowledgeGraphNode[];
  edges: LearningKnowledgeGraphEdge[];
  insights: {
    centralTopics: string[];
    weaknesses: string[];
    strengths: string[];
    recommendations: string[];
  };
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

export const fetchLearningKnowledgeGraph = async (
  request: LearningKnowledgeGraphRequest,
): Promise<LearningKnowledgeGraphResponse> => {
  const response = await fetch(`${knowledgeGraphApiBase}/learning`, {
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

  return (await response.json()) as LearningKnowledgeGraphResponse;
};
