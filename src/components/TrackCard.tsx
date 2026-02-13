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
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Link
        to={`/tracks/${id}`}
        className="group flex flex-col gap-4 rounded-xl border border-border bg-gradient-card p-6 shadow-card transition-all hover:border-primary/30 hover:shadow-glow"
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}20`, color }}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span className="rounded-md bg-secondary px-2 py-1">{courseCount} courses</span>
          <span className="rounded-md bg-secondary px-2 py-1">{duration}</span>
          <span className="rounded-md bg-secondary px-2 py-1">{level}</span>
        </div>
      </Link>
    </motion.div>
  );
};

export default TrackCard;
