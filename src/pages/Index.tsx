import { motion } from "framer-motion";
import { BookOpen, Users, Globe2, Brain, Sparkles, ArrowRight, Code2, Radio, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import TrackCard from "../components/TrackCard";
import { tracks } from "../data/tracks";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Tutoring",
    description: "Get personalized hints and explanations that adapt to your learning style.",
  },
  {
    icon: Globe2,
    title: "Multilingual Support",
    description: "Learn in Hindi, Tamil, Telugu, Bengali and more Indian languages.",
  },
  {
    icon: Sparkles,
    title: "Adaptive Learning",
    description: "Spaced repetition and mastery tracking to boost retention and confidence.",
  },
  {
    icon: BookOpen,
    title: "Track-Based Courses",
    description: "Structured learning paths — no searching. Everything you need in one place.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero pt-32 pb-20">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        </div>

        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Personalised. Adaptive. Multilingual.
            </div>
            <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Learn at your pace,{" "}
              <span className="text-gradient-primary">master</span> with confidence
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
              Track-based learning with AI tutors, step-by-step guidance, and spaced repetition — 
              all in your preferred language. No more searching, just learning.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/tracks"
                className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-glow transition-all hover:scale-105"
              >
                Explore Tracks
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/courses"
                className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-8 py-3.5 text-base font-semibold text-secondary-foreground transition-colors hover:bg-muted"
              >
                Browse Courses
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-8 text-center"
          >
            {[
              { value: "6+", label: "Learning Tracks" },
              { value: "36+", label: "Expert Courses" },
              { value: "8+", label: "Indian Languages" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-gradient-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-12 text-center"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl font-bold text-foreground md:text-4xl"
            >
              Why LearnPath?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mx-auto mt-3 max-w-xl text-muted-foreground"
            >
              Built for how students actually learn — with adaptive AI, clear feedback, and everything organized into tracks.
            </motion.p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={i + 2}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="group rounded-xl border border-border bg-gradient-card p-6 shadow-card transition-all hover:border-primary/20"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracks Preview */}
      <section className="border-t border-border py-20">
        <div className="container">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Learning Tracks</h2>
              <p className="mt-2 text-muted-foreground">Structured paths from beginner to mastery</p>
            </div>
            <Link
              to="/tracks"
              className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex"
            >
              View all tracks <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tracks.slice(0, 6).map((track, i) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <TrackCard {...track} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2026 LearnPath. Personalised learning for every student.</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
