import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface TrackCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  courseCount: number;
  duration: string;
  level: string;
  color: string;
}

const TrackCard = ({ id, title, description, icon: Icon, courseCount, duration, level, color }: TrackCardProps) => {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
      <Link
        to={`/tracks/${id}`}
        className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}1f`, color }}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">{level}</span>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">{description}</p>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-md bg-secondary px-2.5 py-1">{courseCount} courses</span>
          <span className="rounded-md bg-secondary px-2.5 py-1">{duration}</span>
        </div>
      </Link>
    </motion.div>
  );
};

export default TrackCard;
