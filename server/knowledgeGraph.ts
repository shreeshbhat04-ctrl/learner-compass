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

export type LearningKnowledgeGraphNodeType =
  | "learner"
  | "branch"
  | "language"
  | "problem"
  | "topic"
  | "mistake"
  | "tech-tag"
  | "company";

export interface LearningKnowledgeGraphNode {
  id: string;
  type: LearningKnowledgeGraphNodeType;
  label: string;
  weight: number;
  meta?: Record<string, string | number | boolean>;
}

export interface LearningKnowledgeGraphEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
}

export interface LearningKnowledgeGraphInsights {
  centralTopics: string[];
  weaknesses: string[];
  strengths: string[];
  recommendations: string[];
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
  insights: LearningKnowledgeGraphInsights;
}

interface LanguageStats {
  attempts: number;
  passedTests: number;
  totalTests: number;
}

const normalize = (value: string): string => value.trim().toLowerCase();

const toSlug = (value: string): string =>
  normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const titleCase = (value: string): string => {
  const normalized = normalize(value);
  if (!normalized) return "";
  return normalized
    .split(/\s+/g)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
};

const recommendationForMistake = (label: string): string => {
  const lowered = normalize(label);
  if (lowered.includes("compile") || lowered.includes("syntax")) {
    return "Run a quick syntax-first pass before executing: brackets, delimiters, and function signatures.";
  }
  if (lowered.includes("runtime") || lowered.includes("null") || lowered.includes("undefined")) {
    return "Add guard checks and targeted logs around failing branches to catch runtime edge cases early.";
  }
  if (lowered.includes("time") || lowered.includes("complex")) {
    return "Refactor toward lower complexity with memoization, hashing, or two-pointer/sliding-window patterns.";
  }
  if (lowered.includes("wrong") || lowered.includes("output")) {
    return "Compare expected vs actual output for the first failing case and trace divergence step-by-step.";
  }
  return "Pick one recurring error pattern and solve 3 focused problems that target that exact weakness.";
};

export const buildLearningKnowledgeGraph = (
  request: LearningKnowledgeGraphRequest,
): LearningKnowledgeGraphResponse => {
  const nodeMap = new Map<string, LearningKnowledgeGraphNode>();
  const edgeMap = new Map<string, LearningKnowledgeGraphEdge>();
  const languageStats = new Map<string, LanguageStats>();

  const addNode = (
    id: string,
    type: LearningKnowledgeGraphNodeType,
    label: string,
    weight = 1,
    meta?: Record<string, string | number | boolean>,
  ): void => {
    const existing = nodeMap.get(id);
    if (!existing) {
      nodeMap.set(id, {
        id,
        type,
        label,
        weight,
        meta,
      });
      return;
    }

    existing.weight += weight;
    if (meta) {
      existing.meta = {
        ...(existing.meta ?? {}),
        ...meta,
      };
    }
  };

  const addEdge = (source: string, target: string, relation: string, weight = 1): void => {
    const key = `${source}|${target}|${relation}`;
    const existing = edgeMap.get(key);

    if (!existing) {
      edgeMap.set(key, {
        source,
        target,
        relation,
        weight,
      });
      return;
    }

    existing.weight += weight;
  };

  const learnerId = `learner:${toSlug(request.userId || request.name || "learner")}`;
  const learnerWeight = Math.max(1, request.totalRuns ?? request.recentSessions.length);
  addNode(learnerId, "learner", request.name.trim(), learnerWeight, {
    branch: request.branch,
    solvedProblems: request.solvedProblems ?? 0,
    acceptanceRate: request.acceptanceRate ?? 0,
  });

  const branchLabel = request.branch.trim().toUpperCase();
  const branchId = `branch:${toSlug(request.branch)}`;
  addNode(branchId, "branch", branchLabel, 1);
  addEdge(learnerId, branchId, "belongs-to", 1);

  const upsertLanguageSignal = (languageValue?: string, relation?: string): string | null => {
    if (!languageValue) return null;
    const normalizedLanguage = normalize(languageValue);
    if (!normalizedLanguage) return null;

    const languageId = `language:${toSlug(normalizedLanguage)}`;
    addNode(languageId, "language", titleCase(normalizedLanguage), 1);
    addEdge(learnerId, languageId, relation ?? "codes-in", 1);
    return languageId;
  };

  const strongestLanguageId = upsertLanguageSignal(request.strongestLanguage, "strongest-language");
  const focusLanguageId = upsertLanguageSignal(request.focusLanguage, "focus-language");

  for (const session of request.recentSessions) {
    const languageId = upsertLanguageSignal(session.language, "codes-in");
    if (!languageId) continue;

    const languageKey = normalize(session.language);
    const aggregate =
      languageStats.get(languageKey) ?? {
        attempts: 0,
        passedTests: 0,
        totalTests: 0,
      };

    aggregate.attempts += 1;
    aggregate.passedTests += Math.max(0, session.passedTests);
    aggregate.totalTests += Math.max(0, session.totalTests);
    languageStats.set(languageKey, aggregate);

    const problemId = session.problemId?.trim()
      ? `problem:${toSlug(session.problemId)}`
      : `problem:${toSlug(session.problemTitle)}`;
    addNode(problemId, "problem", session.problemTitle.trim(), 1, {
      passedTests: session.passedTests,
      totalTests: session.totalTests,
      tookMs: session.tookMs,
    });

    const isSolved = session.totalTests > 0 && session.passedTests >= session.totalTests;
    addEdge(learnerId, problemId, isSolved ? "solved" : "attempted", 1);
    addEdge(problemId, languageId, "implemented-in", 1);

    const topicCandidate = session.topicTitle?.trim() || session.topicId?.trim();
    if (topicCandidate) {
      const topicId = session.topicId?.trim()
        ? `topic:${toSlug(session.topicId)}`
        : `topic:${toSlug(topicCandidate)}`;
      addNode(topicId, "topic", topicCandidate, 1);
      addEdge(problemId, topicId, "belongs-to", 1);

      if (!isSolved && session.totalTests > 0) {
        const failureRatio = Math.max(0, (session.totalTests - session.passedTests) / session.totalTests);
        addEdge(languageId, topicId, "struggles-in", Math.max(0.2, failureRatio));
      }
    }
  }

  for (const mistake of request.topMistakes) {
    const label = mistake.label.trim();
    if (!label) continue;

    const mistakeId = `mistake:${toSlug(label)}`;
    addNode(mistakeId, "mistake", label, Math.max(1, mistake.count), {
      count: mistake.count,
    });
    addEdge(learnerId, mistakeId, "struggles-with", Math.max(1, mistake.count));

    if (focusLanguageId) {
      addEdge(focusLanguageId, mistakeId, "shows-up-in", Math.max(1, mistake.count * 0.4));
    }
  }

  for (const tag of request.techViseTags) {
    const cleaned = tag.trim();
    if (!cleaned) continue;

    const tagId = `tech-tag:${toSlug(cleaned)}`;
    addNode(tagId, "tech-tag", titleCase(cleaned), 1);
    addEdge(learnerId, tagId, "discusses", 1);
  }

  for (const company of request.targetCompanies) {
    const cleaned = company.trim();
    if (!cleaned) continue;

    const companyId = `company:${toSlug(cleaned)}`;
    addNode(companyId, "company", cleaned, 1);
    addEdge(learnerId, companyId, "targets", 1);
  }

  if (strongestLanguageId && focusLanguageId && strongestLanguageId !== focusLanguageId) {
    addEdge(strongestLanguageId, focusLanguageId, "cross-train", 0.8);
  }

  const degreeMap = new Map<string, number>();
  for (const edge of edgeMap.values()) {
    degreeMap.set(edge.source, (degreeMap.get(edge.source) ?? 0) + edge.weight);
    degreeMap.set(edge.target, (degreeMap.get(edge.target) ?? 0) + edge.weight);
  }

  const centralTopics = Array.from(nodeMap.values())
    .filter((node) => node.type === "topic")
    .sort((left, right) => {
      const leftScore = (degreeMap.get(left.id) ?? 0) + left.weight;
      const rightScore = (degreeMap.get(right.id) ?? 0) + right.weight;
      if (rightScore !== leftScore) return rightScore - leftScore;
      return left.label.localeCompare(right.label);
    })
    .slice(0, 6)
    .map((node) => node.label);

  const weaknesses = request.topMistakes
    .slice()
    .sort((left, right) => right.count - left.count)
    .slice(0, 3)
    .map((mistake) => mistake.label);

  for (const [language, stats] of languageStats.entries()) {
    if (stats.attempts < 2 || stats.totalTests <= 0) continue;
    const accuracy = stats.passedTests / stats.totalTests;
    if (accuracy < 0.65) {
      weaknesses.push(`${titleCase(language)} accuracy ${Math.round(accuracy * 100)}%`);
    }
  }

  const strengths: string[] = [];
  for (const [language, stats] of languageStats.entries()) {
    if (stats.attempts < 2 || stats.totalTests <= 0) continue;
    const accuracy = stats.passedTests / stats.totalTests;
    if (accuracy >= 0.8) {
      strengths.push(`${titleCase(language)} accuracy ${Math.round(accuracy * 100)}%`);
    }
  }

  if (request.solvedProblems && request.solvedProblems > 0) {
    strengths.push(`${request.solvedProblems} problems solved`);
  }

  if (request.acceptanceRate !== undefined && request.acceptanceRate >= 70) {
    strengths.push(`Overall acceptance ${request.acceptanceRate}%`);
  }

  const recommendations = Array.from(
    new Set(
      weaknesses.slice(0, 4).map((item) => recommendationForMistake(item)),
    ),
  );

  if (recommendations.length === 0) {
    recommendations.push("Choose one target company role and map a 2-week topic plan from your weakest recent sessions.");
  }

  const nodes = Array.from(nodeMap.values())
    .sort((left, right) => {
      if (right.weight !== left.weight) return right.weight - left.weight;
      return left.label.localeCompare(right.label);
    })
    .slice(0, 220);

  const activeNodeIds = new Set(nodes.map((node) => node.id));
  const edges = Array.from(edgeMap.values())
    .filter((edge) => activeNodeIds.has(edge.source) && activeNodeIds.has(edge.target))
    .sort((left, right) => {
      if (right.weight !== left.weight) return right.weight - left.weight;
      return left.relation.localeCompare(right.relation);
    })
    .slice(0, 420);

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      sessionCount: request.recentSessions.length,
    },
    nodes,
    edges,
    insights: {
      centralTopics,
      weaknesses: weaknesses.slice(0, 8),
      strengths: strengths.slice(0, 8),
      recommendations: recommendations.slice(0, 6),
    },
  };
};
