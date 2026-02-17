import { useState, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, RotateCcw, Terminal, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { completeExercise } from "@/services/progressService";
import { useParams, useNavigate } from "react-router-dom";
import { exercises, getTemplateForLanguage, Language, Exercise } from "../data/exercises";
import ReactMarkdown from "react-markdown";

const LabView = () => {
    const { user } = useAuth();
    const { labId } = useParams();
    const navigate = useNavigate();

    // State
    const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
    const [language, setLanguage] = useState<Language>("python");
    const [code, setCode] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize based on URL
    useEffect(() => {
        if (labId && labId !== "playground") {
            const exercise = exercises.find(e => e.id === labId);
            if (exercise) {
                setActiveExercise(exercise);
                setLanguage(exercise.language);
                // We'll load the code in the next effect for consistency
            } else {
                toast.error("Exercise not found, redirecting to playground");
                navigate("/lab/playground");
            }
        } else {
            setActiveExercise(null);
            // Default to Python for playground if not already set or switching modes
        }
        setIsLoaded(true);
    }, [labId, navigate]);

    // Load code logic (Template vs LocalStorage)
    useEffect(() => {
        if (!isLoaded) return;

        const storageKey = activeExercise
            ? `lab_code_${user?.uid}_${activeExercise.id}`
            : `lab_code_${user?.uid}_playground_${language}`;

        const savedCode = user ? localStorage.getItem(storageKey) : null;

        if (savedCode) {
            setCode(savedCode);
        } else {
            if (activeExercise) {
                setCode(activeExercise.template);
            } else {
                setCode(getTemplateForLanguage(language));
            }
        }
    }, [language, activeExercise, user, isLoaded]);

    // Auto-save
    useEffect(() => {
        if (user && code && isLoaded) {
            const timeoutId = setTimeout(() => {
                const storageKey = activeExercise
                    ? `lab_code_${user.uid}_${activeExercise.id}`
                    : `lab_code_${user.uid}_playground_${language}`;
                localStorage.setItem(storageKey, code);
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [code, language, activeExercise, user, isLoaded]);

    const runCode = useCallback(async () => {
        setIsRunning(true);
        setOutput("Compiling/Interpreting...");

        try {
            const response = await fetch('http://localhost:5000/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language, code }),
            });

            const data = await response.json();

            if (response.ok) {
                setOutput(data.output || "Execution completed with no output.");
                if (!data.output?.includes("Error")) {
                    toast.success("Code executed successfully");

                    // Award XP if it's a specific exercise
                    if (user && activeExercise) {
                        // Simple validation: if it runs without error, mark as complete for now
                        // In real implementation, we would check against testCases
                        completeExercise(user.uid, activeExercise.id, activeExercise.difficulty);
                        toast.success(`Exercise Completed! +${activeExercise.difficulty === 'beginner' ? 10 : 25} XP`);
                    }
                }
            } else {
                setOutput(`Error: ${data.error || "Unknown error occurred"}`);
                toast.error("Execution failed");
            }
        } catch (error) {
            setOutput("Error connecting to execution server.");
            toast.error("Network Error");
        } finally {
            setIsRunning(false);
        }
    }, [language, code, user, activeExercise]);

    // Keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!isRunning) runCode();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isRunning, runCode]);

    const handleResetCode = () => {
        const template = activeExercise ? activeExercise.template : getTemplateForLanguage(language);
        setCode(template);
        if (user) {
            const storageKey = activeExercise
                ? `lab_code_${user.uid}_${activeExercise.id}`
                : `lab_code_${user.uid}_playground_${language}`;
            localStorage.removeItem(storageKey);
        }
        toast.success("Code reset to template");
    };

    const handleNextExercise = () => {
        const currentIndex = exercises.findIndex(e => e.id === activeExercise?.id);
        if (currentIndex !== -1 && currentIndex < exercises.length - 1) {
            navigate(`/lab/${exercises[currentIndex + 1].id}`);
        }
    };

    const handlePrevExercise = () => {
        const currentIndex = exercises.findIndex(e => e.id === activeExercise?.id);
        if (currentIndex > 0) {
            navigate(`/lab/${exercises[currentIndex - 1].id}`);
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    {/* Instructions Panel */}
                    <ResizablePanel defaultSize={30} minSize={20} className="bg-slate-900/50 border-r border-slate-700/50 flex flex-col backdrop-blur-sm">
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                                        <BookOpen className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">
                                        {activeExercise ? activeExercise.title : "Playground"}
                                    </h2>
                                </div>
                                <div className="flex gap-2">
                                    {activeExercise && (
                                        <span className={`border px-3 py-1.5 rounded-full font-semibold uppercase text-xs ${activeExercise.difficulty === 'beginner' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                activeExercise.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {activeExercise.difficulty}
                                        </span>
                                    )}
                                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-3 py-1.5 rounded-full font-semibold uppercase">
                                        {language === "matlab" ? "Octave" : language === "cpp" ? "C++" : language === "csharp" ? "C#" : language.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="prose prose-invert prose-slate max-w-none">
                                {activeExercise ? (
                                    <ReactMarkdown>{activeExercise.description}</ReactMarkdown>
                                ) : (
                                    <>
                                        <h3>Code Playground</h3>
                                        <p>Experiment with code in various languages. Select your preferred language from the dropdown above.</p>
                                        <p>Features:</p>
                                        <ul>
                                            <li>Multi-language support</li>
                                            <li>Real-time execution</li>
                                            <li>Auto-save</li>
                                        </ul>
                                    </>
                                )}
                            </div>

                            {activeExercise && activeExercise.hints && (
                                <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <h4 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                                        <LightbulbIcon className="h-4 w-4" /> Hints
                                    </h4>
                                    <ul className="list-disc list-inside text-sm text-slate-300">
                                        {activeExercise.hints.map((hint, i) => (
                                            <li key={i}>{hint}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Navigation Footer for Exercises */}
                        {activeExercise && (
                            <div className="p-4 border-t border-slate-700/50 bg-slate-900/50 flex justify-between">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrevExercise}
                                    disabled={exercises.findIndex(e => e.id === activeExercise?.id) === 0}
                                    className="border-slate-700 hover:bg-slate-800 text-slate-300"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextExercise}
                                    disabled={exercises.findIndex(e => e.id === activeExercise?.id) === exercises.length - 1}
                                    className="border-slate-700 hover:bg-slate-800 text-slate-300"
                                >
                                    Next <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        )}
                    </ResizablePanel>

                    <ResizableHandle />

                    {/* Editor & Terminal Panel */}
                    <ResizablePanel defaultSize={70} className="flex flex-col">
                        <ResizablePanelGroup direction="vertical">
                            <ResizablePanel defaultSize={70} className="flex flex-col bg-slate-950">
                                <div className="w-full bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 py-3 flex-shrink-0 z-50">
                                    <div className="flex items-center gap-3">
                                        {/* Language/Exercise Selector */}
                                        {!activeExercise ? (
                                            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                                                <SelectTrigger className="w-[140px] h-9 text-sm bg-slate-900 border-slate-700 text-white hover:bg-slate-800 focus:ring-2 focus:ring-emerald-500">
                                                    <SelectValue placeholder="Select language" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-slate-700 z-[9999]">
                                                    <SelectItem value="python">Python</SelectItem>
                                                    <SelectItem value="c">C</SelectItem>
                                                    <SelectItem value="cpp">C++</SelectItem>
                                                    <SelectItem value="java">Java</SelectItem>
                                                    <SelectItem value="javascript">JavaScript</SelectItem>
                                                    <SelectItem value="csharp">C#</SelectItem>
                                                    <SelectItem value="go">Go</SelectItem>
                                                    <SelectItem value="rust">Rust</SelectItem>
                                                    <SelectItem value="matlab">Octave/MATLAB</SelectItem>
                                                    <SelectItem value="verilog">Verilog</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded border border-slate-700">
                                                <span className="text-sm font-mono text-slate-300">
                                                    {activeExercise.language}
                                                </span>
                                            </div>
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleResetCode}
                                            className="h-9 text-slate-400 hover:text-white hover:bg-slate-800"
                                            title="Reset to template"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 hidden md:inline">Ctrl+Enter to run</span>
                                        <Button
                                            size="sm"
                                            onClick={runCode}
                                            disabled={isRunning}
                                            className="h-9 gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isRunning ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                                            {isRunning ? "Running..." : "Run Code"}
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <Editor
                                        height="100%"
                                        width="100%"
                                        language={language === "matlab" ? "octave" : language === "cpp" ? "cpp" : language === "csharp" ? "csharp" : language}
                                        theme="vs-dark"
                                        value={code}
                                        onChange={(value) => setCode(value || "")}
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 15,
                                            padding: { top: 16, bottom: 16 },
                                            lineNumbers: "on",
                                            scrollBeyondLastLine: false,
                                            automaticLayout: true,
                                            wordWrap: "on",
                                            fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                                            fontLigatures: true
                                        }}
                                    />
                                </div>
                            </ResizablePanel>

                            <ResizableHandle />

                            {/* Terminal Panel */}
                            <ResizablePanel defaultSize={30} className="bg-slate-950 border-t border-slate-700/50">
                                <div className="flex justify-between items-center px-4 py-3 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <Terminal className="h-4 w-4 text-emerald-400" />
                                        <span className="text-sm font-semibold uppercase tracking-wide">Terminal Output</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-slate-800 text-slate-400 hover:text-white"
                                        onClick={() => setOutput("")}
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="p-4 h-full overflow-auto">
                                    {output ? (
                                        <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
                                            {output.split('\n').map((line, idx) => {
                                                let className = 'text-emerald-400/90';
                                                if (line.includes('Error') || line.includes('error')) className = 'text-red-400';
                                                else if (line.includes('Warning') || line.includes('warning')) className = 'text-yellow-400';
                                                else if (line.includes('Compilation') || line.includes('Runtime')) className = 'text-orange-400';
                                                else if (line.trim().startsWith('>>>') || line.trim().startsWith('$')) className = 'text-blue-400';

                                                return <span key={idx} className={className}>{line}{'\n'}</span>;
                                            })}
                                        </pre>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                                            <div className="text-center">
                                                <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p>Output will appear here after running your code</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
};

// Helper icon component since lucide-react might not have LightbulbIcon export directly as named above
const LightbulbIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
    </svg>
);

export default LabView;
