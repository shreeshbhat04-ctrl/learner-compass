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

const starterForRuntime = (runtimeName: string | undefined, title: string): string => {
  const normalized = normalize(runtimeName ?? "");

  if (normalized.includes("python")) {
    return `import sys

def solve(raw_input: str):
    # TODO: ${title}
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
    // TODO: ${title}
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
  // TODO: ${title}
  cout << input;
  return 0;
}`;
  }

  if (normalized === "c" || normalized.includes("gcc")) {
    return `#include <stdio.h>

int main() {
  char buffer[4096];
  if (fgets(buffer, sizeof(buffer), stdin)) {
    // TODO: ${title}
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
  // TODO: ${title}
  fmt.Print(string(input))
}`;
  }

  if (normalized.includes("rust")) {
    return `use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    // TODO: ${title}
    print!("{}", input);
}`;
  }

  if (normalized.includes("sql")) {
    return `-- TODO: ${title}
SELECT 1;`;
  }

  return `function solve(rawInput) {
  // TODO: ${title}
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
  return "No output";
};

const CourseLabIDE = ({ selectedQuestion }: CourseLabIDEProps) => {
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
  }, [languages, selectedQuestion?.id]);

  const selectedLanguage = useMemo(
    () => languages.find((language) => language.id === selectedLanguageId),
    [languages, selectedLanguageId],
  );
  const monacoLanguage = inferMonacoLanguage(selectedLanguage?.name);

  useEffect(() => {
    if (!selectedLanguage) return;
    const nextCode = starterForRuntime(
      selectedLanguage.name,
      selectedQuestion?.title ?? "Solve this problem",
    );
    setCode(nextCode);
    setExecutionResult(null);
    setExecutionError(null);
  }, [selectedLanguageId, selectedLanguage, selectedQuestion?.title]);

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
          <h3 className="text-lg font-semibold text-foreground">Multi-Language IDE Lab</h3>
          <p className="text-sm text-muted-foreground">
            Choose runtime, write code, execute with stdin, and validate output.
          </p>
        </div>

        <div className="min-w-[220px]">
          <Select
            value={selectedLanguageId ? String(selectedLanguageId) : undefined}
            onValueChange={(value) => setSelectedLanguageId(Number(value))}
            disabled={isLoadingLanguages || Boolean(runtimeError)}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={isLoadingLanguages ? "Loading languages..." : "Select runtime"}
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
            Stdin Input
          </span>
          <textarea
            value={stdin}
            onChange={(event) => setStdin(event.target.value)}
            className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            placeholder='Example: {"nums":[2,7,11,15],"target":9}'
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Expected Output (optional)
          </span>
          <textarea
            value={expectedOutput}
            onChange={(event) => setExpectedOutput(event.target.value)}
            className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Example: [0,1]"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Active problem: {selectedQuestion?.title ?? "Select a question to contextualize starter code"}
        </p>

        <Button onClick={() => void handleRun()} disabled={isExecuting || Boolean(runtimeError)}>
          {isExecuting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run
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
            Execution Result
          </div>
          <p className="text-xs text-muted-foreground">
            Status: {executionResult.results[0].statusDescription} • Passed:{" "}
            {executionResult.passedCount}/{executionResult.total} • Took: {executionResult.tookMs}ms
          </p>
          <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted/40 p-2 text-xs text-foreground">
            {formatResultOutput(executionResult.results[0])}
          </pre>
        </div>
      )}
    </Card>
  );
};

export default CourseLabIDE;
