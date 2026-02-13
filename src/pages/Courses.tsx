import { motion } from "framer-motion";
import CourseCard from "../components/CourseCard";
import { tracks } from "../data/tracks";

const allCourses = tracks.flatMap((track) =>
  track.courses.map((course) => ({ ...course, trackTitle: track.title, trackColor: track.color }))
);

const CoursesPage = () => {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-foreground">All Courses</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Browse all {allCourses.length} courses across every learning track.
          </p>
        </motion.div>

        {tracks.map((track) => (
          <div key={track.id} className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: track.color }}
              />
              <h2 className="text-xl font-semibold text-foreground">{track.title}</h2>
              <span className="text-sm text-muted-foreground">({track.courses.length} courses)</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {track.courses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  viewport={{ once: true }}
                >
                  <CourseCard {...course} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;
