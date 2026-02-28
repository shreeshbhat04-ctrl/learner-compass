import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, CalendarPlus, ExternalLink, Filter, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  techEvents,
  type TechEvent,
} from "@/data/techEvents";
import { buildGoogleCalendarEventUrl } from "@/services/calendarService";

const ALL_CATEGORIES = "all-categories";
const ALL_MODES = "all-modes";

const formatDate = (value: string): string =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const statusForEvent = (event: TechEvent): { label: string; className: string } => {
  const now = new Date();
  const deadline = new Date(`${event.registrationDeadline}T23:59:59Z`);
  const msLeft = deadline.getTime() - now.getTime();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { label: "Closed", className: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20" };
  }
  if (daysLeft <= 7) {
    return {
      label: `Closing in ${daysLeft}d`,
      className: "bg-orange-500/10 text-orange-700 border-orange-500/20",
    };
  }
  return { label: "Open", className: "bg-green-500/10 text-green-700 border-green-500/20" };
};

const HackathonsPage = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL_CATEGORIES);
  const [modeFilter, setModeFilter] = useState<string>(ALL_MODES);
  const [search, setSearch] = useState("");

  const categories = useMemo(
    () => Array.from(new Set(techEvents.map((event) => event.category))),
    [],
  );
  const modes = useMemo(() => Array.from(new Set(techEvents.map((event) => event.mode))), []);

  const filteredEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return techEvents
      .filter((event) => {
        if (categoryFilter !== ALL_CATEGORIES && event.category !== categoryFilter) return false;
        if (modeFilter !== ALL_MODES && event.mode !== modeFilter) return false;
        if (!normalizedSearch) return true;

        return (
          event.title.toLowerCase().includes(normalizedSearch) ||
          event.organizer.toLowerCase().includes(normalizedSearch) ||
          event.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch))
        );
      })
      .sort((left, right) => left.registrationDeadline.localeCompare(right.registrationDeadline));
  }, [categoryFilter, modeFilter, search]);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-border/50 bg-gradient-card p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tech Hackathons & Events</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Dedicated tech-only events, challenges, and open-source programs for builders.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Trophy className="h-3.5 w-3.5" />
              Curated event board
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Search
              </p>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title, organizer, or tag"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Category
              </p>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Mode
              </p>
              <Select value={modeFilter} onValueChange={setModeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_MODES}>All modes</SelectItem>
                  {modes.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          Showing {filteredEvents.length} events
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {filteredEvents.map((event, index) => {
            const status = statusForEvent(event);
            const googleCalendarUrl = buildGoogleCalendarEventUrl(event);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="h-full border border-border/60 bg-gradient-card p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                    <span className="rounded-full border border-border bg-background/70 px-2 py-0.5 text-xs text-muted-foreground">
                      {event.category}
                    </span>
                    <span className="rounded-full border border-border bg-background/70 px-2 py-0.5 text-xs text-muted-foreground">
                      {event.mode}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{event.organizer}</p>

                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <p>
                      <span className="font-medium text-foreground">Deadline:</span>{" "}
                      {formatDate(event.registrationDeadline)}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Event:</span>{" "}
                      {formatDate(event.eventStart)} - {formatDate(event.eventEnd)}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Location:</span> {event.location}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Level:</span> {event.level}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span
                        key={`${event.id}-${tag}`}
                        className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-primary">{event.prize}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href={googleCalendarUrl} target="_blank" rel="noreferrer">
                          Add to Google Calendar
                          <CalendarPlus className="ml-1.5 h-3.5 w-3.5" />
                        </a>
                      </Button>
                      <Button size="sm" asChild>
                        <a href={event.url} target="_blank" rel="noreferrer">
                          Visit Event
                          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <Card className="mt-6 border border-border/50 bg-gradient-card p-6 text-center">
            <CalendarClock className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No events matched your filters. Try broader search terms.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HackathonsPage;
