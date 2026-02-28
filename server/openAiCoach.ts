import { z } from "zod";

export interface CoachMistakePattern {
  label: string;
  count: number;
}

export interface CoachRecentSession {
  problemTitle: string;
  language: string;
  passedTests: number;
  totalTests: number;
  tookMs: number;
}

export interface ProfileInsightRequest {
  userId: string;
  name: string;
  branch: string;
  acceptanceRate: number;
  streak: number;
  solvedProblems: number;
  strongestLanguage?: string;
  focusLanguage?: string;
  topMistakes: CoachMistakePattern[];
  recentSessions: CoachRecentSession[];
}

export interface ProfileInsight {
  headline: string;
  conciseBio: string;
  strengths: string[];
  focusAreas: string[];
  nextAction: string;
  signature: string;
}

export interface GapAnalysisFailedCase {
  testCase: number;
  statusDescription: string;
  stderr?: string;
  compileOutput?: string;
  message?: string;
}

export interface GapAnalysisRequest {
  userId: string;
  branch: string;
  problemTitle: string;
  language: string;
  runtimeName?: string;
  passedTests: number;
  totalTests: number;
  tookMs: number;
  failedCases: GapAnalysisFailedCase[];
  topMistakes: CoachMistakePattern[];
}

export interface GapAnalysis {
  summary: string;
  rootCauses: string[];
  practicePlan: string[];
  confidence: "low" | "medium" | "high";
}

export interface HintRequest {
  userId: string;
  branch: string;
  problemTitle: string;
  language: string;
  runtimeName?: string;
  sourceCode: string;
  passedTests: number;
  totalTests: number;
  failedCase?: GapAnalysisFailedCase;
  topMistakes: CoachMistakePattern[];
}

export interface HintResponse {
  hint: string;
  nudges: string[];
  checklist: string[];
}

export interface OpenAiCoachClientOptions {
  apiUrl: string;
  apiKey: string;
  model: string;
  requestTimeoutMs: number;
  maxContextChars: number;
}

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const toText = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
};

const truncate = (value: string, maxChars: number): string => {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars)}...(truncated)`;
};

const parseJsonPayload = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error("OpenAI returned non-JSON content");
  }
};

const extractMessageContent = (payload: unknown): string => {
  if (!payload || typeof payload !== "object") {
    throw new Error("OpenAI response is invalid");
  }

  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    throw new Error("OpenAI response has no choices");
  }

  const firstChoice = choices[0];
  if (!firstChoice || typeof firstChoice !== "object") {
    throw new Error("OpenAI response choice is invalid");
  }

  const message = (firstChoice as { message?: unknown }).message;
  if (!message || typeof message !== "object") {
    throw new Error("OpenAI response message is missing");
  }

  const content = (message as { content?: unknown }).content;
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    const textParts = content
      .map((part) => {
        if (!part || typeof part !== "object") return "";
        const text = (part as { text?: unknown }).text;
        return typeof text === "string" ? text : "";
      })
      .filter(Boolean);

    if (textParts.length > 0) {
      return textParts.join("\n");
    }
  }

  throw new Error("OpenAI response content is empty");
};

const profileInsightSchema = z.object({
  headline: z.string().min(8).max(120),
  conciseBio: z.string().min(20).max(260),
  strengths: z.array(z.string().min(2).max(90)).min(1).max(4),
  focusAreas: z.array(z.string().min(2).max(90)).min(1).max(4),
  nextAction: z.string().min(10).max(180),
  signature: z.string().min(3).max(80),
});

const gapAnalysisSchema = z.object({
  summary: z.string().min(20).max(220),
  rootCauses: z.array(z.string().min(3).max(160)).min(1).max(4),
  practicePlan: z.array(z.string().min(3).max(160)).min(1).max(4),
  confidence: z.enum(["low", "medium", "high"]),
});

const hintSchema = z.object({
  hint: z.string().min(20).max(220),
  nudges: z.array(z.string().min(4).max(160)).min(2).max(4),
  checklist: z.array(z.string().min(4).max(160)).min(2).max(4),
});

export class OpenAiCoachClient {
  private readonly apiBaseUrl: string;

  constructor(private readonly options: OpenAiCoachClientOptions) {
    this.apiBaseUrl = trimTrailingSlash(options.apiUrl);
  }

  async generateProfileInsight(input: ProfileInsightRequest): Promise<ProfileInsight> {
    const compactInput = {
      userId: input.userId,
      name: input.name,
      branch: input.branch,
      acceptanceRate: input.acceptanceRate,
      streak: input.streak,
      solvedProblems: input.solvedProblems,
      strongestLanguage: toText(input.strongestLanguage ?? ""),
      focusLanguage: toText(input.focusLanguage ?? ""),
      topMistakes: input.topMistakes.slice(0, 4),
      recentSessions: input.recentSessions.slice(0, 6),
    };

    const systemPrompt = [
      "You are a senior learning coach for software students.",
      "Return JSON only and keep output concise, specific, and practical.",
      "Do not use hype. No markdown.",
    ].join(" ");

    const userPrompt = [
      "Create a concise personalized profile for this learner with actionable guidance.",
      "Context:",
      truncate(JSON.stringify(compactInput), this.options.maxContextChars),
      "Required JSON keys: headline, conciseBio, strengths, focusAreas, nextAction, signature.",
    ].join("\n");

    return this.requestStructured(systemPrompt, userPrompt, profileInsightSchema);
  }

  async generateGapAnalysis(input: GapAnalysisRequest): Promise<GapAnalysis> {
    const compactInput = {
      userId: input.userId,
      branch: input.branch,
      problemTitle: input.problemTitle,
      language: input.language,
      runtimeName: toText(input.runtimeName ?? ""),
      passedTests: input.passedTests,
      totalTests: input.totalTests,
      tookMs: input.tookMs,
      failedCases: input.failedCases.slice(0, 6),
      topMistakes: input.topMistakes.slice(0, 4),
    };

    const systemPrompt = [
      "You are a debugging coach that identifies concrete learning gaps.",
      "Return JSON only and prioritize likely root causes from evidence.",
      "Do not provide full code solutions.",
    ].join(" ");

    const userPrompt = [
      "Analyze this failed coding attempt and produce a focused gap analysis.",
      "Context:",
      truncate(JSON.stringify(compactInput), this.options.maxContextChars),
      "Required JSON keys: summary, rootCauses, practicePlan, confidence.",
    ].join("\n");

    return this.requestStructured(systemPrompt, userPrompt, gapAnalysisSchema);
  }

  async generateHint(input: HintRequest): Promise<HintResponse> {
    const compactInput = {
      userId: input.userId,
      branch: input.branch,
      problemTitle: input.problemTitle,
      language: input.language,
      runtimeName: toText(input.runtimeName ?? ""),
      passedTests: input.passedTests,
      totalTests: input.totalTests,
      failedCase: input.failedCase,
      topMistakes: input.topMistakes.slice(0, 4),
      sourceCode: truncate(input.sourceCode, Math.max(300, this.options.maxContextChars)),
    };

    const systemPrompt = [
      "You are a strict hint-only coding tutor.",
      "Never provide full code or line-by-line final solutions.",
      "Give conceptual and directional hints only.",
      "Return JSON only.",
    ].join(" ");

    const userPrompt = [
      "Learner is stuck. Give a compact hint response.",
      "Context:",
      truncate(JSON.stringify(compactInput), this.options.maxContextChars),
      "Required JSON keys: hint, nudges, checklist.",
    ].join("\n");

    return this.requestStructured(systemPrompt, userPrompt, hintSchema);
  }

  private async requestStructured<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: z.ZodType<T>,
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.requestTimeoutMs);

    try {
      const response = await fetch(`${this.apiBaseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${this.options.apiKey}`,
        },
        body: JSON.stringify({
          model: this.options.model,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const responseText = await response.text().catch(() => "");
        throw new Error(`OpenAI request failed (${response.status}): ${responseText}`);
      }

      const payload = (await response.json()) as unknown;
      const content = extractMessageContent(payload);
      const parsed = parseJsonPayload(content);
      return schema.parse(parsed);
    } finally {
      clearTimeout(timeout);
    }
  }
}
