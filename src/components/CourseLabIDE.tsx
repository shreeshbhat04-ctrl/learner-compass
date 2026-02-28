import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { Code2, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  executeCode,
  fetchExecutionLanguages,
  type ExecuteCodeResponse,
  type ExecutionLanguage,
} from "@/services/codeExecutionService";
import type { CourseQuestion } from "@/services/courseQuestionService";

interface CourseLabIDEProps {
  selectedQuestion: CourseQuestion | null;
}

type UiLanguage = "en" | "hi" | "ta";

const normalize = (value: string): string => value.toLowerCase().trim();

const inferMonacoLanguage = (runtimeName?: string): string => {
  const normalized = normalize(runtimeName ?? "");

  if (normalized.includes("typescript")) return "typescript";
  if (normalized.includes("javascript") || normalized.includes("node")) return "javascript";
  if (normalized.includes("python")) return "python";
  if (normalized.includes("java")) return "java";
  if (normalized.includes("c++")) return "cpp";
  if (normalized === "c" || normalized.includes("gcc")) return "c";
  if (normalized.includes("c#")) return "csharp";
  if (normalized.includes("go")) return "go";
  if (normalized.includes("rust")) return "rust";
  if (normalized.includes("sql")) return "sql";
  if (normalized.includes("php")) return "php";
  if (normalized.includes("ruby")) return "ruby";
  if (normalized.includes("swift")) return "swift";
  if (normalized.includes("kotlin")) return "kotlin";
  return "plaintext";
};

const UI_TEXT: Record<
  UiLanguage,
  {
    heading: string;
    subtitle: string;
    runtimeLabel: string;
    loadingRuntimes: string;
    selectRuntime: string;
    uiLanguageLabel: string;
    stdinLabel: string;
    expectedLabel: string;
    stdinPlaceholder: string;
    expectedPlaceholder: string;
    activeProblem: string;
    selectProblem: string;
    run: string;
    running: string;
    outputTitle: string;
    noOutput: string;
    noMetadata: string;
  }
> = {
  en: {
    heading: "Multi-Language IDE Lab",
    subtitle: "Choose runtime, write code, execute with stdin, and validate output.",
    runtimeLabel: "Runtime",
    loadingRuntimes: "Loading languages...",
    selectRuntime: "Select runtime",
    uiLanguageLabel: "Interface",
    stdinLabel: "Stdin Input",
    expectedLabel: "Expected Output (optional)",
    stdinPlaceholder: 'Example: {"nums":[2,7,11,15],"target":9}',
    expectedPlaceholder: "Example: [0,1]",
    activeProblem: "Active problem",
    selectProblem: "Select a question to contextualize starter code",
    run: "Run",
    running: "Running",
    outputTitle: "Execution Result",
    noOutput: "No output",
    noMetadata: "No metadata available.",
  },
  hi: {
    heading: "बहुभाषी IDE लैब",
    subtitle: "रनटाइम चुनें, कोड लिखें, stdin के साथ चलाएं और आउटपुट जांचें।",
    runtimeLabel: "रनटाइम",
    loadingRuntimes: "भाषाएं लोड हो रही हैं...",
    selectRuntime: "रनटाइम चुनें",
    uiLanguageLabel: "इंटरफेस",
    stdinLabel: "इनपुट (stdin)",
    expectedLabel: "अपेक्षित आउटपुट (वैकल्पिक)",
    stdinPlaceholder: 'उदाहरण: {"nums":[2,7,11,15],"target":9}',
    expectedPlaceholder: "उदाहरण: [0,1]",
    activeProblem: "सक्रिय प्रश्न",
    selectProblem: "स्टार्टर कोड के लिए प्रश्न चुनें",
    run: "चलाएं",
    running: "चल रहा है",
    outputTitle: "निष्पादन परिणाम",
    noOutput: "कोई आउटपुट नहीं",
    noMetadata: "कोई मेटाडाटा उपलब्ध नहीं।",
  },
  ta: {
    heading: "பன்மொழி IDE ஆய்வகம்",
    subtitle: "Runtime தேர்வு செய்து, code எழுதிச் stdin மூலம் இயக்கி output சரிபார்க்கவும்.",
    runtimeLabel: "Runtime",
    loadingRuntimes: "மொழிகள் ஏற்றப்படுகின்றன...",
    selectRuntime: "Runtime தேர்வு செய்யவும்",
    uiLanguageLabel: "இடைமுக மொழி",
    stdinLabel: "உள்ளீடு (stdin)",
    expectedLabel: "எதிர்பார்க்கப்பட்ட output (விருப்பம்)",
    stdinPlaceholder: 'உதாரணம்: {"nums":[2,7,11,15],"target":9}',
    expectedPlaceholder: "உதாரணம்: [0,1]",
    activeProblem: "செயலில் உள்ள கேள்வி",
    selectProblem: "Starter code உருவாக்க ஒரு கேள்வியைத் தேர்வு செய்யவும்",
    run: "இயக்கு",
    running: "இயங்குகிறது",
    outputTitle: "இயக்க முடிவு",
    noOutput: "வெளியீடு இல்லை",
    noMetadata: "மெட்டாடேட்டா இல்லை.",
  },
};

const localizedTodo = (language: UiLanguage, title: string): string => {
  if (language === "hi") return `// TODO: ${title} के लिए समाधान लिखें`;
  if (language === "ta") return `// TODO: ${title} க்கான தீர்வை எழுதவும்`;
  return `// TODO: ${title}`;
};

const starterForRuntime = (
  runtimeName: string | undefined,
  title: string,
  uiLanguage: UiLanguage,
): string => {
  const normalized = normalize(runtimeName ?? "");
  const todo = localizedTodo(uiLanguage, title);

  if (normalized.includes("python")) {
    return `import sys

def solve(raw_input: str):
    ${todo.replace("//", "#")}
    return raw_input.strip()

if __name__ == "__main__":
    raw = sys.stdin.read()
    result = solve(raw)
    print(result)`;
  }

  if (normalized.includes("java") && !normalized.includes("javascript")) {
    return `import java.io.*;

public class Main {
  public static void main(String[] args) throws Exception {
    BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
    String input = reader.lines().reduce("", (acc, line) -> acc + line + "\\n").trim();
    ${todo}
    System.out.print(input);
  }
}`;
  }

  if (normalized.includes("c++")) {
    return `#include <bits/stdc++.h>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  string input((istreambuf_iterator<char>(cin)), istreambuf_iterator<char>());
  ${todo}
  cout << input;
  return 0;
}`;
  }

  if (normalized === "c" || normalized.includes("gcc")) {
    return `#include <stdio.h>

int main() {
  char buffer[4096];
  if (fgets(buffer, sizeof(buffer), stdin)) {
    ${todo}
    printf("%s", buffer);
  }
  return 0;
}`;
  }

  if (normalized.includes("go")) {
    return `package main

import (
  "fmt"
  "io"
  "os"
)

func main() {
  input, _ := io.ReadAll(os.Stdin)
  ${todo}
  fmt.Print(string(input))
}`;
  }

  if (normalized.includes("rust")) {
    return `use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    ${todo}
    print!("{}", input);
}`;
  }

  if (normalized.includes("sql")) {
    const sqlTodo =
      uiLanguage === "hi"
        ? `-- TODO: ${title} के लिए SQL लिखें`
        : uiLanguage === "ta"
          ? `-- TODO: ${title} க்கான SQL எழுதவும்`
          : `-- TODO: ${title}`;
    return `${sqlTodo}
SELECT 1;`;
  }

  return `function solve(rawInput) {
  ${todo}
  return rawInput.trim();
}

const fs = require("fs");
const input = fs.readFileSync(0, "utf8");
const output = solve(input);
process.stdout.write(typeof output === "string" ? output : JSON.stringify(output));`;
};

const resolvePreferredLanguageId = (
  languages: ExecutionLanguage[],
  hints: string[],
): number | null => {
  if (languages.length === 0) return null;

  for (const hint of hints) {
    const normalizedHint = normalize(hint);
    const matched = languages.find((language) => normalize(language.name).includes(normalizedHint));
    if (matched) return matched.id;
  }

  return languages[0].id;
};

const formatResultOutput = (result: ExecuteCodeResponse["results"][number]): string => {
  if (result.compileOutput) return result.compileOutput;
  if (result.stderr) return result.stderr;
  if (result.stdout) return result.stdout;
  if (result.message) return result.message;
  return "";
};

const CourseLabIDE = ({ selectedQuestion }: CourseLabIDEProps) => {
  const [uiLanguage, setUiLanguage] = useState<UiLanguage>("en");
  const [languages, setLanguages] = useState<ExecutionLanguage[]>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);
  const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<ExecuteCodeResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadLanguages = async () => {
      setIsLoadingLanguages(true);
      setRuntimeError(null);

      try {
        const available = await fetchExecutionLanguages();
        if (cancelled) return;
        setLanguages(available);
      } catch (error) {
        if (cancelled) return;
        setRuntimeError(
          error instanceof Error ? error.message : "Unable to load runtime languages right now.",
        );
      } finally {
        if (!cancelled) {
          setIsLoadingLanguages(false);
        }
      }
    };

    void loadLanguages();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (languages.length === 0) return;
    const preferredId = resolvePreferredLanguageId(
      languages,
      selectedQuestion?.languageHints ?? ["javascript", "python"],
    );
    setSelectedLanguageId(preferredId);
  }, [languages, selectedQuestion?.id, selectedQuestion?.languageHints]);

  const selectedLanguage = useMemo(
    () => languages.find((language) => language.id === selectedLanguageId),
    [languages, selectedLanguageId],
  );
  const monacoLanguage = inferMonacoLanguage(selectedLanguage?.name);
  const t = UI_TEXT[uiLanguage];

  useEffect(() => {
    if (!selectedLanguage) return;
    const nextCode = starterForRuntime(
      selectedLanguage.name,
      selectedQuestion?.title ?? "Solve this problem",
      uiLanguage,
    );
    setCode(nextCode);
    setExecutionResult(null);
    setExecutionError(null);
  }, [selectedLanguageId, selectedLanguage, selectedQuestion?.title, uiLanguage]);

  const handleRun = async () => {
    if (!selectedLanguageId) {
      setExecutionError("Select a runtime before executing.");
      return;
    }

    setIsExecuting(true);
    setExecutionError(null);
    setExecutionResult(null);

    try {
      const result = await executeCode({
        languageId: selectedLanguageId,
        sourceCode: code,
        testCases: [
          {
            input: stdin,
            expectedOutput: expectedOutput.trim().length > 0 ? expectedOutput : undefined,
          },
        ],
      });

      setExecutionResult(result);
    } catch (error) {
      setExecutionError(error instanceof Error ? error.message : "Execution failed.");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Card className="border border-border/50 bg-gradient-card p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t.heading}</h3>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>

        <div className="grid min-w-[260px] gap-2 sm:grid-cols-2">
          <Select value={uiLanguage} onValueChange={(value) => setUiLanguage(value as UiLanguage)}>
            <SelectTrigger>
              <SelectValue placeholder={t.uiLanguageLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिन्दी</SelectItem>
              <SelectItem value="ta">தமிழ்</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedLanguageId ? String(selectedLanguageId) : undefined}
            onValueChange={(value) => setSelectedLanguageId(Number(value))}
            disabled={isLoadingLanguages || Boolean(runtimeError)}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={isLoadingLanguages ? t.loadingRuntimes : t.selectRuntime}
              />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.id} value={String(language.id)}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {runtimeError && (
        <p className="mb-3 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-700">
          {runtimeError}
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-border">
        <Editor
          height="360px"
          language={monacoLanguage}
          value={code}
          onChange={(value) => setCode(value ?? "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            wordWrap: "on",
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t.stdinLabel}
            </span>
          <textarea
            value={stdin}
            onChange={(event) => setStdin(event.target.value)}
            className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={t.stdinPlaceholder}
          />
        </label>

        <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t.expectedLabel}
            </span>
          <textarea
            value={expectedOutput}
            onChange={(event) => setExpectedOutput(event.target.value)}
            className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={t.expectedPlaceholder}
          />
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {t.activeProblem}: {selectedQuestion?.title ?? t.selectProblem}
        </p>

        <Button onClick={() => void handleRun()} disabled={isExecuting || Boolean(runtimeError)}>
          {isExecuting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.running}
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              {t.run}
            </>
          )}
        </Button>
      </div>

      {executionError && (
        <p className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {executionError}
        </p>
      )}

      {executionResult && executionResult.results[0] && (
        <div className="mt-4 rounded-lg border border-border bg-background/70 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <Code2 className="h-4 w-4 text-primary" />
            {t.outputTitle}
          </div>
          <p className="text-xs text-muted-foreground">
            Status: {executionResult.results[0].statusDescription} • Passed:{" "}
            {executionResult.passedCount}/{executionResult.total} • Took: {executionResult.tookMs}ms
          </p>
          <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted/40 p-2 text-xs text-foreground">
            {formatResultOutput(executionResult.results[0]) || t.noOutput}
          </pre>
        </div>
      )}
    </Card>
  );
};

export default CourseLabIDE;
