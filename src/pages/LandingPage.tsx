import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Code, Bot, TrendingUp, Sparkles, Zap, Target } from "lucide-react";

const LandingPage = () => {
    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <main className="relative flex-1 flex flex-col justify-center items-center text-center p-6 space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800">
                        <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                            AI-Powered Learning Platform
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                        Master Engineering with <br />
                        <span className="inline-flex items-center gap-3">
                            AI & Practice
                            <Zap className="h-10 w-10 md:h-12 md:w-12 text-yellow-500 inline-block animate-pulse" />
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        Personalized learning paths for <span className="font-semibold text-indigo-600 dark:text-indigo-400">Computer Science</span> and <span className="font-semibold text-purple-600 dark:text-purple-400">Electronics</span>.
                        <br />
                        Code, Simulate, and Learn with an AI Tutor by your side.
                    </p>
                </motion.div>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                >
                    <Button
                        size="lg"
                        className="text-lg px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        asChild
                    >
                        <Link to="/signup">
                            Get Started for Free
                            <Sparkles className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="text-lg px-8 py-6 border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105"
                        asChild
                    >
                        <Link to="/courses">Explore Courses</Link>
                    </Button>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left max-w-6xl w-full"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <div className="group p-8 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl w-fit mb-4 group-hover:bg-indigo-500 group-hover:scale-110 transition-all duration-300">
                            <Code className="h-7 w-7 text-indigo-600 dark:text-indigo-400 group-hover:text-white" />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-slate-800 dark:text-slate-100">Interactive Labs</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Run Python, MATLAB, and Verilog directly in your browser. No setup required.
                        </p>
                    </div>

                    <div className="group p-8 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl w-fit mb-4 group-hover:bg-purple-500 group-hover:scale-110 transition-all duration-300">
                            <Bot className="h-7 w-7 text-purple-600 dark:text-purple-400 group-hover:text-white" />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-slate-800 dark:text-slate-100">AI Tutor</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Get instant help and explanations tailored to your specific course context.
                        </p>
                    </div>

                    <div className="group p-8 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 hover:border-pink-400 dark:hover:border-pink-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                        <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl w-fit mb-4 group-hover:bg-pink-500 group-hover:scale-110 transition-all duration-300">
                            <TrendingUp className="h-7 w-7 text-pink-600 dark:text-pink-400 group-hover:text-white" />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-slate-800 dark:text-slate-100">Track Progress</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Earn XP, maintain streaks, and visualize your learning journey.
                        </p>
                    </div>
                </motion.div>

                {/* Social proof section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex flex-wrap items-center justify-center gap-8 mt-12 text-slate-600 dark:text-slate-400"
                >
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-semibold">500+ Active Learners</span>
                    </div>
                    <div className="h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <span className="font-semibold">50+ Courses</span>
                    </div>
                    <div className="h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
                    <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                        <span className="font-semibold">10K+ Labs Completed</span>
                    </div>
                </motion.div>
            </main>

            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

export default LandingPage;