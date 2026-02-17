import { motion } from "framer-motion";
import { Zap, Trophy, Flame, Code, TrendingUp, Award, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import {
  getProgress,
  getRecentActivity,
  getAchievements,
  getCourseProgress,
  getTrackProgress,
} from "@/services/progressService";
import RecentActivity from "@/components/RecentActivity";
import ProgressChart from "@/components/ProgressChart";
import AchievementBadge from "@/components/AchievementBadge";
import { getTracksByBranch } from "@/services/trackService";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const { user } = useAuth();
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [courseProgresses, setCourseProgresses] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const progress = getProgress(user.uid);
      setXp(progress.xp);
      setStreak(progress.streak);
      setRecentActivities(getRecentActivity(user.uid, 5));
      setAchievements(getAchievements(user.uid));

      // Get course progress
      const tracks = getTracksByBranch(user.branch);
      const courses = tracks.flatMap((track) =>
        track.courses.map((course) => ({
          courseId: course.id,
          courseTitle: course.title,
          progress: getCourseProgress(user.uid, course.id),
        }))
      );
      setCourseProgresses(courses.filter((c) => c.progress > 0).slice(0, 5));
    }
  }, [user]);

  // Get continue learning course
  const getContinueLearningCourse = () => {
    if (!user) return null;
    const tracks = getTracksByBranch(user.branch);
    for (const track of tracks) {
      for (const course of track.courses) {
        const progress = getCourseProgress(user.uid, course.id);
        if (progress > 0 && progress < 100) {
          return { course, track, progress };
        }
      }
    }
    // If no in-progress course, return first course
    if (tracks.length > 0 && tracks[0].courses.length > 0) {
      return {
        course: tracks[0].courses[0],
        track: tracks[0],
        progress: 0,
      };
    }
    return null;
  };

  const continueLearning = getContinueLearningCourse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="container py-12 space-y-10 max-w-6xl">
        {/* Header Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 rounded-2xl shadow-xl"
        >
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-center text-white">
            <div>
              <h1 className="text-3xl font-bold mb-2">Hey, Learner! 👋</h1>
              <p className="text-indigo-100">Ready to continue your journey?</p>
            </div>
            <div className="flex gap-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                  <Trophy className="h-6 w-6 text-yellow-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-100">Total XP</p>
                  <p className="text-2xl font-bold">{xp.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                  <Flame className="h-6 w-6 text-orange-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-100">Streak</p>
                  <p className="text-2xl font-bold">{streak} {streak === 1 ? 'Day' : 'Days'}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Continue Learning */}
        {continueLearning && (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">
              Pick up where you left off
            </h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-8 border-none shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-semibold">
                        COURSE
                      </span>
                      <span className="text-blue-100 text-sm font-medium">
                        {continueLearning.track.title}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{continueLearning.course.title}</h3>
                    <p className="text-blue-100">{continueLearning.course.description}</p>
                    <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-white h-full rounded-full transition-all"
                        style={{ width: `${continueLearning.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-blue-100 mt-2">{continueLearning.progress}% Complete</p>
                  </div>
                  <Button
                    size="lg"
                    className="gap-2 bg-white text-indigo-600 hover:bg-blue-50 font-semibold px-8 shadow-lg"
                    asChild
                  >
                    <Link
                      to={`/tracks/${continueLearning.track.id}/courses/${continueLearning.course.id}`}
                    >
                      <Zap className="h-5 w-5" />
                      Resume Learning
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          </section>
        )}

        {/* Quick Access to Virtual Lab */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">
            Quick Access
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="p-6 border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500 rounded-xl">
                    <Code className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Virtual Lab</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Code in Python, C, C++, Java, JavaScript, and more
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                  asChild
                >
                  <Link to="/lab/virtual-lab">
                    <Code className="h-4 w-4" />
                    Open Lab
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">
            Recent Activity
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <RecentActivity activities={recentActivities} />
          </motion.div>
        </section>

        {/* Course Progress */}
        {courseProgresses.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">
              Your Progress
            </h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <ProgressChart courses={courseProgresses} />
            </motion.div>
          </section>
        )}

        {/* Achievements */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">
            Achievements
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              {achievements.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {[
                    'first_exercise',
                    'ten_exercises',
                    'fifty_exercises',
                    'hundred_xp',
                    'thousand_xp',
                    'week_streak',
                    'month_streak',
                  ].map((achievementId) => (
                    <AchievementBadge
                      key={achievementId}
                      achievementId={achievementId}
                      unlocked={achievements.includes(achievementId)}
                      size="md"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Complete exercises to unlock achievements!
                </p>
              )}
            </Card>
          </motion.div>
        </section>

        {/* Recommended Tracks */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">
            Recommended Tracks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/tracks/cse">
                <Card className="group p-8 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-slate-800">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
                      <svg
                        className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Computer Science
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Master Python, Web Dev, and DSA.
                  </p>
                  <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore Track →
                  </div>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link to="/tracks/ece">
                <Card className="group p-8 border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-slate-800">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:bg-purple-500 group-hover:scale-110 transition-all duration-300">
                      <svg
                        className="h-6 w-6 text-purple-600 dark:text-purple-400 group-hover:text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Electronics & Comm.
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Signal Processing, MATLAB, and Verilog.
                  </p>
                  <div className="mt-4 flex items-center text-sm text-purple-600 dark:text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore Track →
                  </div>
                </Card>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;