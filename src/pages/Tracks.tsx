import { motion } from "framer-motion";
import TrackCard from "../components/TrackCard";
import { tracks } from "../data/tracks";

const TracksPage = () => {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-foreground">Learning Tracks</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Choose a track and follow a structured path to mastery. No searching — everything is laid out for you.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <TrackCard {...track} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TracksPage;
