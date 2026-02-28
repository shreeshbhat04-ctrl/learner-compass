const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? "");
const codeApiBase = `${apiBaseUrl}/api/code`;
const LOCAL_JS_LANGUAGE_ID = 1;
const LOCAL_JS_LANGUAGE: ExecutionLanguage = {
  id: LOCAL_JS_LANGUAGE_ID,
  name: "JavaScript (Local Fallback)",
};
let preferLocalExecution = false;

export interface ExecutionLanguage {
  id: number;
  name: string;
}

export interface ExecutionTestCase {
  input: string;
  expectedOutput?: string;
}

export interface ExecuteCodeRequest {
  languageId: number;
  sourceCode: string;
  testCases: ExecutionTestCase[];
}

export interface ExecuteTestResult {
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
  diagnostic?: ExecutionDiagnostic;
}

export interface ExecutionDiagnostic {
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

export interface ExecuteCodeResponse {
  total: number;
  passedCount: number;
  tookMs: number;
  provider?: string;
  fallbackFrom?: string;
  results: ExecuteTestResult[];
}

interface LanguagesPayload {
  total: number;
  provider?: string;
  fallbackFrom?: string;
  languages: ExecutionLanguage[];
}

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = await response.json();
    if (typeof payload.error === "string") {
      return payload.error;
    }
  } catch {
    // Ignore JSON parsing failures.
  }

  return `Request failed (${response.status})`;
};

const normalizeOutput = (value?: string): string => (value ?? "").trim();

const runJavaScriptLocally = ({
  sourceCode,
  input,
}: {
  sourceCode: string;
  input: string;
}): { stdout?: string; stderr?: string; timeSec?: string } => {
  const startedAt = performance.now();

  try {
    let output = "";
    const fsShim = {
      readFileSync: () => input,
    };
    const processShim = {
      stdout: {
        write: (value: string) => {
          output += String(value);
        },
      },
    };
    const requireShim = (name: string) => {
      if (name === "fs") return fsShim;
      throw new Error(`Local fallback only supports require("fs"), got: ${name}`);
    };

    const runner = new Function("require", "process", `${sourceCode}`);
    runner(requireShim, processShim);

    const tookMs = performance.now() - startedAt;
    return {
      stdout: output,
      timeSec: (tookMs / 1000).toFixed(3),
    };
  } catch (error) {
    const tookMs = performance.now() - startedAt;
    return {
      stderr: error instanceof Error ? error.message : "Local execution failed",
      timeSec: (tookMs / 1000).toFixed(3),
    };
  }
};

const executeCodeLocally = (request: ExecuteCodeRequest): ExecuteCodeResponse => {
  const startedAt = performance.now();

  const results: ExecuteTestResult[] = request.testCases.map((testCase, index) => {
    if (request.languageId !== LOCAL_JS_LANGUAGE_ID) {
      return {
        testCase: index + 1,
        passed: false,
        statusId: 9,
        statusDescription: "Runtime not available in local fallback",
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        message: "Choose JavaScript runtime or start backend compiler service.",
      };
    }

    const localRun = runJavaScriptLocally({
      sourceCode: request.sourceCode,
      input: testCase.input,
    });

    if (localRun.stderr) {
      return {
        testCase: index + 1,
        passed: false,
        statusId: 11,
        statusDescription: "Runtime Error (Local Fallback)",
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        stderr: localRun.stderr,
        time: localRun.timeSec,
      };
    }

    const expected = normalizeOutput(testCase.expectedOutput);
    const actual = normalizeOutput(localRun.stdout);
    const passed = expected.length === 0 ? true : actual === expected;

    return {
      testCase: index + 1,
      passed,
      statusId: passed ? 3 : 4,
      statusDescription: passed ? "Accepted (Local Fallback)" : "Wrong Answer (Local Fallback)",
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      stdout: localRun.stdout,
      time: localRun.timeSec,
    };
  });

  const passedCount = results.filter((result) => result.passed).length;
  return {
    total: results.length,
    passedCount,
    tookMs: Math.round(performance.now() - startedAt),
    provider: "local-js",
    fallbackFrom: "remote-api",
    results,
  };
};

export const fetchExecutionLanguages = async (): Promise<ExecutionLanguage[]> => {
  if (preferLocalExecution) {
    return [LOCAL_JS_LANGUAGE];
  }

  try {
    const response = await fetch(`${codeApiBase}/languages`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status >= 500) {
        preferLocalExecution = true;
        return [LOCAL_JS_LANGUAGE];
      }
      throw new Error(await parseErrorMessage(response));
    }

    const payload = (await response.json()) as LanguagesPayload;
    return payload.languages.length > 0 ? payload.languages : [LOCAL_JS_LANGUAGE];
  } catch {
    preferLocalExecution = true;
    return [LOCAL_JS_LANGUAGE];
  }
};

export const executeCode = async (request: ExecuteCodeRequest): Promise<ExecuteCodeResponse> => {
  if (preferLocalExecution) {
    return executeCodeLocally(request);
  }

  try {
    const response = await fetch(`${codeApiBase}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status >= 500) {
        preferLocalExecution = true;
        return executeCodeLocally(request);
      }
      throw new Error(await parseErrorMessage(response));
    }

    return (await response.json()) as ExecuteCodeResponse;
  } catch {
    preferLocalExecution = true;
    return executeCodeLocally(request);
  }
};
