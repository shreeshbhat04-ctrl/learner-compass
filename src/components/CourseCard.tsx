import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, BookOpen, CheckCircle2 } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: number;
  progress?: number;
  image?: string;
  trackId?: string;
}

const CourseCard = ({ id, title, description, duration, lessons, progress, trackId }: CourseCardProps) => {
  const href = trackId ? `/tracks/${trackId}/courses/${id}` : "#";
  return (
    <Link to={href}>
      <motion.div
        whileHover={{ y: -2 }}
        className="group flex flex-col gap-3 rounded-xl border border-border bg-gradient-card p-5 shadow-card transition-all hover:border-primary/30 cursor-pointer h-full"
      >
      <div className="flex items-start justify-between">
        <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h4>
        {progress !== undefined && progress >= 100 && (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
        )}
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {duration}
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="h-3.5 w-3.5" /> {lessons} lessons
        </span>
      </div>
      {progress !== undefined && (
        <div className="mt-1">
          <div className="h-1.5 w-full rounded-full bg-secondary">
            <div
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <span className="mt-1 text-xs text-muted-foreground">{progress}% complete</span>
        </div>
      )}
      </motion.div>
    </Link>
  );
};

export default CourseCard;
