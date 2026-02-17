import { setTimeout as wait } from "node:timers/promises";
import vm from "node:vm";

export interface CodeExecutionLanguage {
  id: number;
  name: string;
}

export interface CodeExecutionTestCase {
  input: string;
  expectedOutput?: string;
}

export interface CodeExecutionRequest {
  languageId: number;
  sourceCode: string;
  testCases: CodeExecutionTestCase[];
}

export interface CodeExecutionTestResult {
  testCase: number;
  passed: boolean;
  statusId: number;
  statusDescription: string;
  input: string;
  expectedOutput?: string;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  message?: string;
  time?: string;
  memory?: number;
  diagnostic?: CodeExecutionDiagnostic;
}

export interface CodeExecutionDiagnostic {
  category:
    | "success"
    | "compilation"
    | "runtime"
    | "wrong-answer"
    | "timeout"
    | "resource"
    | "system";
  severity: "info" | "warning" | "error";
  summary: string;
  likelyCauses: string[];
  suggestedFixes: string[];
  lineHints: number[];
  confidence: number;
}

interface ProviderStatus {
  id: number;
  description: string;
}

interface Judge0Submission {
  token?: string;
  status?: ProviderStatus;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  time?: string;
  memory?: number;
}

interface Judge0LanguagePayload {
  id: number;
  name: string;
}

interface PistonRuntimePayload {
  language?: string;
  version?: string;
  aliases?: string[];
}

interface PistonExecutionPayload {
  language?: string;
  version?: string;
  run?: {
    stdout?: string | null;
    stderr?: string | null;
    output?: string | null;
    code?: number;
    signal?: string | null;
  };
  compile?: {
    stdout?: string | null;
    stderr?: string | null;
    output?: string | null;
    code?: number;
  };
  message?: string | null;
}

interface PistonLanguageSpec {
  language: string;
  version: string;
}

export interface CodeExecutionClientOptions {
  provider: "judge0" | "rapidapi-judge0" | "piston" | "local-js";
  apiUrl: string;
  apiKey?: string;
  apiHost?: string;
  requestTimeoutMs: number;
  pollIntervalMs: number;
  pollAttempts: number;
}

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const cleanOutput = (value?: string | null): string | undefined => {
  if (value === undefined || value === null) return undefined;
  const normalized = value.replace(/\r\n/g, "\n").replace(/\n+$/, "");
  if (!normalized) return "";
  return normalized.length > 20_000 ? `${normalized.slice(0, 20_000)}...(truncated)` : normalized;
};

const normalizeForComparison = (value?: string): string => (value ?? "").trim().replace(/\r\n/g, "\n");
const statusIsTerminal = (statusId: number): boolean => statusId !== 1 && statusId !== 2;

const extractLineHints = (value: string, sourceLineCount?: number): number[] => {
  const hints = new Set<number>();
  const linePatterns = [
    /solution\.[^:\s]*:(\d+)\b/gi,
    /solution\.[^:\s]*:(\d+):\d+/gi,
    /<anonymous>:(\d+):\d+/g,
    /\bline\s+(\d+)\b/gi,
    /:(\d+):\d+/g,
  ];
  const maxLine = sourceLineCount && sourceLineCount > 0 ? sourceLineCount : 20_000;

  for (const pattern of linePatterns) {
    let match: RegExpExecArray | null = null;
    while ((match = pattern.exec(value)) !== null) {
      const line = Number(match[1]);
      if (Number.isFinite(line) && line > 0 && line <= maxLine) {
        hints.add(line);
      }
    }
  }

  return Array.from(hints).slice(0, 5);
};

const contains = (haystack: string, patterns: RegExp[]): boolean =>
  patterns.some((pattern) => pattern.test(haystack));

const toErrorDetails = (error: unknown): { name: string; message: string; stack?: string } => {
  if (error instanceof Error) {
    return {
      name: error.name || "Error",
      message: error.message || "Unknown execution failure",
      stack: typeof error.stack === "string" ? error.stack : undefined,
    };
  }

  if (typeof error === "object" && error !== null) {
    const nameValue = (error as { name?: unknown }).name;
    const messageValue = (error as { message?: unknown }).message;
    const stackValue = (error as { stack?: unknown }).stack;

    return {
      name: typeof nameValue === "string" && nameValue.length > 0 ? nameValue : "Error",
      message:
        typeof messageValue === "string" && messageValue.length > 0
          ? messageValue
          : "Unknown execution failure",
      stack: typeof stackValue === "string" && stackValue.length > 0 ? stackValue : undefined,
    };
  }

  return {
    name: "Error",
    message: typeof error === "string" && error.length > 0 ? error : "Unknown execution failure",
  };
};

const diagnosticsFromResult = ({
  languageName,
  passed,
  statusId,
  statusDescription,
  stderr,
  compileOutput,
  message,
  sourceLineCount,
}: {
  languageName?: string;
  passed: boolean;
  statusId: number;
  statusDescription: string;
  stderr?: string;
  compileOutput?: string;
  message?: string;
  sourceLineCount?: number;
}): CodeExecutionDiagnostic => {
  const raw = [compileOutput, stderr, message, statusDescription].filter(Boolean).join("\n");
  const lowerRaw = raw.toLowerCase();
  const lineHints = extractLineHints(raw, sourceLineCount);
  const runtimeName = languageName ?? "runtime";

  if (passed) {
    return {
      category: "success",
      severity: "info",
      summary: "Execution completed successfully.",
      likelyCauses: [],
      suggestedFixes: [],
      lineHints: [],
      confidence: 1,
    };
  }

  if (!passed && (statusId === 3 || /wrong answer/i.test(statusDescription) || statusId === 4)) {
    return {
      category: "wrong-answer",
      severity: "warning",
      summary: "Output did not match expected value.",
      likelyCauses: [
        "Edge case logic is missing.",
        "Output format differs from exact expected output.",
      ],
      suggestedFixes: [
        "Compare expected vs actual for the first failing case and find the earliest mismatch.",
        "Validate parsing and output formatting (ordering, spaces, brackets, casing).",
      ],
      lineHints,
      confidence: 0.74,
    };
  }

  if (statusId === 6 || compileOutput) {
    const likelyCauses: string[] = [];
    const suggestedFixes: string[] = [];

    if (
      contains(lowerRaw, [
        /syntaxerror/,
        /unexpected token/,
        /invalid syntax/,
        /expected .* before/,
        /unterminated/,
      ])
    ) {
      likelyCauses.push("Syntax issue or malformed expression.");
      suggestedFixes.push("Check parentheses, commas, braces, and string delimiters near flagged lines.");
    }

    if (
      contains(lowerRaw, [
        /cannot find symbol/,
        /not defined/,
        /undeclared/,
        /unknown identifier/,
        /nameerror/,
      ])
    ) {
      likelyCauses.push("Unknown variable/function/class name.");
      suggestedFixes.push("Verify spelling, scope, and imports for referenced identifiers.");
    }

    if (
      contains(lowerRaw, [
        /type mismatch/,
        /incompatible types/,
        /cannot convert/,
        /expected .* got/,
      ])
    ) {
      likelyCauses.push("Type mismatch in assignment, function call, or return value.");
      suggestedFixes.push("Align variable and return types with function signatures and expected structures.");
    }

    if (
      contains(lowerRaw, [
        /indentationerror/,
        /taberror/,
      ])
    ) {
      likelyCauses.push("Invalid indentation.");
      suggestedFixes.push("Use consistent indentation width and avoid mixing tabs/spaces.");
    }

    if (likelyCauses.length === 0) {
      likelyCauses.push("Compilation failed before runtime.");
      suggestedFixes.push("Read the first compiler error and fix it first; secondary errors may cascade.");
    }

    return {
      category: "compilation",
      severity: "error",
      summary: `${runtimeName} compiler reported an error.`,
      likelyCauses: likelyCauses.slice(0, 4),
      suggestedFixes: suggestedFixes.slice(0, 4),
      lineHints,
      confidence: 0.86,
    };
  }

  if (statusId === 5 || /timed out|time limit/i.test(raw)) {
    return {
      category: "timeout",
      severity: "error",
      summary: "Execution exceeded time limits.",
      likelyCauses: [
        "Algorithmic complexity is too high for input size.",
        "Loop/recursion may be re-processing repeated states.",
      ],
      suggestedFixes: [
        "Reduce complexity (for example O(n^2) -> O(n log n) or O(n)).",
        "Use memoization/hash maps or early exits to avoid repeated work.",
      ],
      lineHints,
      confidence: 0.84,
    };
  }

  if (
    statusId === 11 ||
    /runtime|exception|traceback|segmentation fault|nullpointer|indexerror|outofbounds/i.test(raw)
  ) {
    const likelyCauses: string[] = [];
    const suggestedFixes: string[] = [];

    if (
      contains(lowerRaw, [
        /indexerror/,
        /out of range/,
        /outofbounds/,
        /arrayindexoutofbounds/,
      ])
    ) {
      likelyCauses.push("Array/string index access is out of bounds.");
      suggestedFixes.push("Validate indices before access and guard edge-case lengths.");
    }

    if (
      contains(lowerRaw, [
        /nullpointer/,
        /cannot read properties of undefined/,
        /none type/,
        /undefined/,
      ])
    ) {
      likelyCauses.push("Null/undefined object used without validation.");
      suggestedFixes.push("Add null checks before property access or method calls.");
    }

    if (
      contains(lowerRaw, [
        /division by zero/,
        /zerodivisionerror/,
      ])
    ) {
      likelyCauses.push("Division by zero encountered.");
      suggestedFixes.push("Guard denominator values before division.");
    }

    if (
      contains(lowerRaw, [
        /maximum call stack size exceeded/,
        /recursionerror/,
      ])
    ) {
      likelyCauses.push("Recursion depth exceeded / infinite recursion.");
      suggestedFixes.push("Fix base case and consider iterative approach.");
    }

    if (likelyCauses.length === 0) {
      likelyCauses.push("Unhandled runtime exception.");
      suggestedFixes.push("Reproduce with failing input and inspect variable states around line hints.");
    }

    return {
      category: "runtime",
      severity: "error",
      summary: `${runtimeName} runtime threw an exception.`,
      likelyCauses: likelyCauses.slice(0, 4),
      suggestedFixes: suggestedFixes.slice(0, 4),
      lineHints,
      confidence: 0.82,
    };
  }

  return {
    category: "system",
    severity: "error",
    summary: "Execution provider returned an unexpected failure.",
    likelyCauses: ["Provider or runtime reported a non-standard error response."],
    suggestedFixes: ["Retry execution and inspect stderr/compile output for more detail."],
    lineHints,
    confidence: 0.55,
  };
};

const compareVersions = (left: string, right: string): number => {
  const leftParts = left.split(/[^0-9]+/g).filter(Boolean).map(Number);
  const rightParts = right.split(/[^0-9]+/g).filter(Boolean).map(Number);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const l = leftParts[index] ?? 0;
    const r = rightParts[index] ?? 0;
    if (l !== r) return l - r;
  }

  return 0;
};

const formatLanguageName = (language: string, version: string): string => {
  const normalized = language.toLowerCase();
  const aliases: Record<string, string> = {
    cpp: "C++",
    c: "C",
    csharp: "C#",
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    java: "Java",
    go: "Go",
    rust: "Rust",
    ruby: "Ruby",
    php: "PHP",
    swift: "Swift",
    kotlin: "Kotlin",
    scala: "Scala",
    sql: "SQL",
  };

  const display = aliases[normalized] ?? `${normalized.slice(0, 1).toUpperCase()}${normalized.slice(1)}`;
  return `${display} (${version})`;
};

export class CodeExecutionClient {
  private readonly apiBaseUrl: string;
  private languageCache: { expiresAt: number; values: CodeExecutionLanguage[] } | null = null;
  private readonly pistonLanguageMap = new Map<number, PistonLanguageSpec>();
  private readonly languageNameById = new Map<number, string>();

  constructor(private readonly options: CodeExecutionClientOptions) {
    this.apiBaseUrl = trimTrailingSlash(options.apiUrl);
  }

  async listLanguages(): Promise<CodeExecutionLanguage[]> {
    if (this.options.provider === "local-js") {
      return this.listLocalLanguages();
    }
    if (this.options.provider === "piston") {
      return this.listPistonLanguages();
    }
    return this.listJudge0Languages();
  }

  async execute(request: CodeExecutionRequest): Promise<CodeExecutionTestResult[]> {
    if (this.options.provider === "local-js") {
      return this.executeWithLocalJs(request);
    }
    if (this.options.provider === "piston") {
      return this.executeWithPiston(request);
    }
    return this.executeWithJudge0(request);
  }

  private async listLocalLanguages(): Promise<CodeExecutionLanguage[]> {
    const now = Date.now();
    if (this.languageCache && now < this.languageCache.expiresAt) {
      return this.languageCache.values;
    }

    const values: CodeExecutionLanguage[] = [
      {
        id: 1,
        name: "JavaScript (Node.js Sandbox)",
      },
    ];
    this.languageNameById.set(1, values[0].name);

    this.languageCache = {
      values,
      expiresAt: now + 10 * 60 * 1000,
    };

    return values;
  }

  private async listJudge0Languages(): Promise<CodeExecutionLanguage[]> {
    const now = Date.now();
    if (this.languageCache && now < this.languageCache.expiresAt) {
      return this.languageCache.values;
    }

    const response = await this.request<Judge0LanguagePayload[]>("/languages", {
      method: "GET",
    });

    const values = response
      .filter((language) => Number.isFinite(language.id) && Boolean(language.name))
      .map((language) => ({
        id: language.id,
        name: language.name,
      }))
      .sort((left, right) => left.name.localeCompare(right.name));

    this.languageNameById.clear();
    for (const language of values) {
      this.languageNameById.set(language.id, language.name);
    }

    this.languageCache = {
      values,
      expiresAt: now + 10 * 60 * 1000,
    };

    return values;
  }

  private async listPistonLanguages(): Promise<CodeExecutionLanguage[]> {
    const now = Date.now();
    if (this.languageCache && now < this.languageCache.expiresAt) {
      return this.languageCache.values;
    }

    const runtimes = await this.request<PistonRuntimePayload[]>("/runtimes", {
      method: "GET",
    });

    const latestByLanguage = new Map<string, PistonLanguageSpec>();

    for (const runtime of runtimes) {
      const language = runtime.language?.trim().toLowerCase();
      const version = runtime.version?.trim();
      if (!language || !version) continue;

      const existing = latestByLanguage.get(language);
      if (!existing || compareVersions(version, existing.version) > 0) {
        latestByLanguage.set(language, { language, version });
      }
    }

    const selected = Array.from(latestByLanguage.values()).sort((left, right) =>
      left.language.localeCompare(right.language),
    );

    this.pistonLanguageMap.clear();
    const values = selected.map((runtime, index) => {
      const id = 2000 + index + 1;
      this.pistonLanguageMap.set(id, runtime);
      return {
        id,
        name: formatLanguageName(runtime.language, runtime.version),
      };
    });

    this.languageNameById.clear();
    for (const language of values) {
      this.languageNameById.set(language.id, language.name);
    }

    this.languageCache = {
      values,
      expiresAt: now + 10 * 60 * 1000,
    };

    return values;
  }

  private async executeWithJudge0(request: CodeExecutionRequest): Promise<CodeExecutionTestResult[]> {
    if (!this.languageNameById.has(request.languageId)) {
      try {
        await this.listJudge0Languages();
      } catch {
        // Continue with unknown runtime label if language metadata fetch fails.
      }
    }
    const languageName = this.languageNameById.get(request.languageId);
    const sourceLineCount = request.sourceCode.split(/\r?\n/).length;
    const results: CodeExecutionTestResult[] = [];

    for (let index = 0; index < request.testCases.length; index += 1) {
      const testCase = request.testCases[index];
      const submission = await this.runJudge0Submission({
        source_code: request.sourceCode,
        language_id: request.languageId,
        stdin: testCase.input,
        expected_output: testCase.expectedOutput,
        redirect_stderr_to_stdout: false,
      });

      const statusId = submission.status?.id ?? 13;
      const statusDescription = submission.status?.description ?? "Internal Error";
      const stdout = cleanOutput(submission.stdout);
      const stderr = cleanOutput(submission.stderr);
      const compileOutput = cleanOutput(submission.compile_output);
      const message = cleanOutput(submission.message);

      const providerAccepted = statusId === 3;
      const expected = normalizeForComparison(testCase.expectedOutput);
      const actual = normalizeForComparison(stdout);
      const outputMatches = expected === "" || expected === actual;

      results.push({
        testCase: index + 1,
        passed: providerAccepted && outputMatches,
        statusId,
        statusDescription,
        input: testCase.input,
        expectedOutput: cleanOutput(testCase.expectedOutput),
        stdout,
        stderr,
        compileOutput,
        message,
        time: submission.time,
        memory: submission.memory,
        diagnostic: diagnosticsFromResult({
          languageName,
          passed: providerAccepted && outputMatches,
          statusId,
          statusDescription,
          stderr,
          compileOutput,
          message,
          sourceLineCount,
        }),
      });
    }

    return results;
  }

  private async executeWithPiston(request: CodeExecutionRequest): Promise<CodeExecutionTestResult[]> {
    if (this.pistonLanguageMap.size === 0) {
      await this.listPistonLanguages();
    }

    const runtime = this.pistonLanguageMap.get(request.languageId);
    if (!runtime) {
      throw new Error("Selected runtime is unavailable in fallback compiler.");
    }
    const languageName =
      this.languageNameById.get(request.languageId) ??
      formatLanguageName(runtime.language, runtime.version);
    const sourceLineCount = request.sourceCode.split(/\r?\n/).length;

    const results: CodeExecutionTestResult[] = [];

    for (let index = 0; index < request.testCases.length; index += 1) {
      const testCase = request.testCases[index];
      const submission = await this.request<PistonExecutionPayload>("/execute", {
        method: "POST",
        body: JSON.stringify({
          language: runtime.language,
          version: runtime.version,
          stdin: testCase.input,
          files: [
            {
              content: request.sourceCode,
            },
          ],
        }),
      });

      const compileCode = submission.compile?.code;
      const runCode = submission.run?.code;
      const compileOutput = cleanOutput(
        submission.compile?.stderr ?? submission.compile?.output ?? submission.compile?.stdout,
      );
      const stdout = cleanOutput(submission.run?.stdout ?? submission.run?.output);
      const stderr = cleanOutput(submission.run?.stderr);
      const message = cleanOutput(submission.message);

      let statusId = 3;
      let statusDescription = "Accepted";

      if (compileCode !== undefined && compileCode !== 0) {
        statusId = 6;
        statusDescription = "Compilation Error";
      } else if (runCode !== undefined && runCode !== 0) {
        statusId = 11;
        statusDescription = "Runtime Error";
      } else if (submission.run?.signal) {
        statusId = 13;
        statusDescription = `Terminated (${submission.run.signal})`;
      }

      const providerAccepted = statusId === 3;
      const expected = normalizeForComparison(testCase.expectedOutput);
      const actual = normalizeForComparison(stdout);
      const outputMatches = expected === "" || expected === actual;

      results.push({
        testCase: index + 1,
        passed: providerAccepted && outputMatches,
        statusId,
        statusDescription,
        input: testCase.input,
        expectedOutput: cleanOutput(testCase.expectedOutput),
        stdout,
        stderr,
        compileOutput,
        message,
        diagnostic: diagnosticsFromResult({
          languageName,
          passed: providerAccepted && outputMatches,
          statusId,
          statusDescription,
          stderr,
          compileOutput,
          message,
          sourceLineCount,
        }),
      });
    }

    return results;
  }

  private async executeWithLocalJs(request: CodeExecutionRequest): Promise<CodeExecutionTestResult[]> {
    const languageName = this.languageNameById.get(1) ?? "JavaScript (Node.js Sandbox)";
    const sourceLineCount = request.sourceCode.split(/\r?\n/).length;
    const results: CodeExecutionTestResult[] = [];

    for (let index = 0; index < request.testCases.length; index += 1) {
      const testCase = request.testCases[index];
      let stdout = "";
      let stderr = "";
      let compileOutput = "";
      let message = "";
      let statusId = 3;
      let statusDescription = "Accepted";

      const stdoutBuffer: string[] = [];
      const stderrBuffer: string[] = [];
      const pushStdout = (value: unknown): void => {
        stdoutBuffer.push(String(value));
      };
      const pushStderr = (value: unknown): void => {
        stderrBuffer.push(String(value));
      };

      const sandbox = {
        require: (moduleName: string) => {
          if (moduleName === "fs") {
            return {
              readFileSync: () => testCase.input,
            };
          }
          throw new Error(`Module '${moduleName}' is not available in sandbox runtime.`);
        },
        process: {
          stdout: {
            write: (value: unknown) => {
              pushStdout(value);
              return true;
            },
          },
          stderr: {
            write: (value: unknown) => {
              pushStderr(value);
              return true;
            },
          },
          exit: (code = 0) => {
            throw new Error(`Program exited with code ${code}`);
          },
        },
        console: {
          log: (...args: unknown[]) => pushStdout(`${args.map(String).join(" ")}\n`),
          error: (...args: unknown[]) => pushStderr(`${args.map(String).join(" ")}\n`),
          warn: (...args: unknown[]) => pushStderr(`${args.map(String).join(" ")}\n`),
        },
        Buffer,
      };

      try {
        const script = new vm.Script(request.sourceCode, { filename: "solution.js" });
        const context = vm.createContext(sandbox);
        script.runInContext(context, { timeout: Math.max(500, this.options.requestTimeoutMs) });
      } catch (error) {
        const details = toErrorDetails(error);
        const errorMessage = details.message;
        const stackTrace = cleanOutput(details.stack) ?? "";
        const formattedMessage =
          errorMessage.toLowerCase().startsWith(details.name.toLowerCase())
            ? errorMessage
            : `${details.name}: ${errorMessage}`;
        const isSyntaxError =
          details.name === "SyntaxError" ||
          /syntaxerror|unexpected token|invalid or unexpected token|unterminated/i.test(errorMessage);

        if (isSyntaxError) {
          statusId = 6;
          statusDescription = "Compilation Error";
          compileOutput = [formattedMessage, stackTrace].filter(Boolean).join("\n");
        } else if (/Script execution timed out/.test(errorMessage)) {
          statusId = 5;
          statusDescription = "Time Limit Exceeded";
          message = errorMessage;
        } else {
          statusId = 11;
          statusDescription = "Runtime Error";
          message = [formattedMessage, stackTrace].filter(Boolean).join("\n");
        }
      }

      stdout = cleanOutput(stdoutBuffer.join("")) ?? "";
      stderr = cleanOutput(stderrBuffer.join("")) ?? "";
      compileOutput = cleanOutput(compileOutput) ?? "";
      message = cleanOutput(message) ?? "";

      const providerAccepted = statusId === 3;
      const expected = normalizeForComparison(testCase.expectedOutput);
      const actual = normalizeForComparison(stdout);
      const outputMatches = expected === "" || expected === actual;

      results.push({
        testCase: index + 1,
        passed: providerAccepted && outputMatches,
        statusId,
        statusDescription,
        input: testCase.input,
        expectedOutput: cleanOutput(testCase.expectedOutput),
        stdout,
        stderr: stderr || undefined,
        compileOutput: compileOutput || undefined,
        message: message || undefined,
        diagnostic: diagnosticsFromResult({
          languageName,
          passed: providerAccepted && outputMatches,
          statusId,
          statusDescription,
          stderr: stderr || undefined,
          compileOutput: compileOutput || undefined,
          message: message || undefined,
          sourceLineCount,
        }),
      });
    }

    return results;
  }

  private async runJudge0Submission(payload: Record<string, unknown>): Promise<Judge0Submission> {
    const submission = await this.request<Judge0Submission>(
      "/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    if (!submission.token) {
      return submission;
    }

    if (submission.status && statusIsTerminal(submission.status.id)) {
      return submission;
    }

    for (let attempt = 0; attempt < this.options.pollAttempts; attempt += 1) {
      await wait(this.options.pollIntervalMs);
      const polled = await this.request<Judge0Submission>(
        `/submissions/${submission.token}?base64_encoded=false`,
        {
          method: "GET",
        },
      );

      if (polled.status && statusIsTerminal(polled.status.id)) {
        return polled;
      }
    }

    return {
      status: {
        id: 13,
        description: "Execution timeout",
      },
      message: "Code execution did not finish in time",
    };
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.requestTimeoutMs);

    const headers = new Headers(init.headers);
    if (init.body) {
      headers.set("Content-Type", "application/json");
    }
    headers.set("Accept", "application/json");

    if (this.options.provider === "rapidapi-judge0") {
      if (this.options.apiKey) {
        headers.set("x-rapidapi-key", this.options.apiKey);
      }
      if (this.options.apiHost) {
        headers.set("x-rapidapi-host", this.options.apiHost);
      }
    } else if (
      (this.options.provider === "judge0" || this.options.provider === "piston") &&
      this.options.apiKey
    ) {
      headers.set("X-Auth-Token", this.options.apiKey);
    }

    const url = `${this.apiBaseUrl}${path}`;

    try {
      const response = await fetch(url, {
        ...init,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        const responseText = await response.text().catch(() => "");
        throw new Error(`Execution provider error (${response.status}): ${responseText}`);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }
}
