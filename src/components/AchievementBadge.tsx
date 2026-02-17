import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getAchievementDetails } from '@/services/progressService';

interface AchievementBadgeProps {
  achievementId: string;
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AchievementBadge = ({ achievementId, unlocked, size = 'md' }: AchievementBadgeProps) => {
  const details = getAchievementDetails(achievementId);
  const sizeClasses = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-24 h-24 text-4xl',
    lg: 'w-32 h-32 text-5xl',
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className="relative"
    >
      <Card
        className={`${sizeClasses[size]} flex items-center justify-center border-2 ${
          unlocked
            ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20'
            : 'border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800 opacity-50'
        }`}
      >
        <div className="text-center">
          <div className="text-4xl mb-1">{details.icon}</div>
          {!unlocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
      </Card>
      <div className="mt-2 text-center">
        <p className={`text-xs font-semibold ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
          {details.name}
        </p>
      </div>
    </motion.div>
  );
};

export default AchievementBadge;
