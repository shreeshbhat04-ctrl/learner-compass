import { motion } from "framer-motion";
import { ArrowRight, Brain, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import TrackCard from "../components/TrackCard";
import { tracks } from "../data/tracks";

const highlights = [
  {
    icon: Search,
    title: "Precise Search",
    description: "Find the right track, course, and problem in seconds with ranked relevance.",
  },
  {
    icon: Brain,
    title: "Personalized Guidance",
    description: "Your profile, hints, and missions adapt to how you actually learn.",
  },
  {
    icon: ShieldCheck,
    title: "Reliable Performance",
    description: "Stable backend architecture and fallback systems built for high traffic.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-hero pb-20 pt-32">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Melete | Earn Every Line
            </p>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
              Learn with clarity,
              <span className="text-gradient-primary"> build with confidence</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground md:text-xl">
              A simple, focused learning platform for students and developers with strong search, adaptive coaching, and
              practical coding workflows.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/tracks"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow"
              >
                Explore Tracks
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Open Dashboard
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                { value: "6+", label: "Tracks" },
                { value: "250+", label: "Problems" },
                { value: "10k+", label: "Target scale users" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-card px-4 py-4 text-left sm:text-center">
                  <p className="text-2xl font-semibold text-foreground">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-foreground">Built for intuitive flow</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Minimal interface, clear actions, and focused learning loops.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <article key={item.title} className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                  <item.icon className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border py-16">
        <div className="container">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold text-foreground">Popular tracks</h2>
              <p className="mt-2 text-muted-foreground">Choose a focused path and move step-by-step.</p>
            </div>
            <Link to="/tracks" className="hidden rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary md:inline-flex">
              View all
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tracks.slice(0, 6).map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                viewport={{ once: true }}
              >
                <TrackCard {...track} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-10">
        <div className="container flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground md:flex-row">
          <p>© 2026 Melete. Earn Every Line.</p>
          <div className="flex items-center gap-4">
            <Link to="/tracks" className="hover:text-foreground">
              Tracks
            </Link>
            <Link to="/courses" className="hover:text-foreground">
              Courses
            </Link>
            <Link to="/techvise" className="hover:text-foreground">
              TechVise
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
