import { motion } from 'framer-motion';
import { ActivityItem } from '@/services/progressService';
import { Code, BookOpen, LogIn, Trophy, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityProps {
  activities: ActivityItem[];
}

const RecentActivity = ({ activities }: RecentActivityProps) => {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'exercise':
        return <Code className="h-4 w-4" />;
      case 'course':
        return <BookOpen className="h-4 w-4" />;
      case 'login':
        return <LogIn className="h-4 w-4" />;
      case 'achievement':
        return <Trophy className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'exercise':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-950/20';
      case 'course':
        return 'text-green-500 bg-green-50 dark:bg-green-950/20';
      case 'login':
        return 'text-purple-500 bg-purple-50 dark:bg-purple-950/20';
      case 'achievement':
        return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  if (activities.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No recent activity</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getColor(activity.type)}`}>
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{activity.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
              {activity.xpGained && (
                <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                  +{activity.xpGained} XP
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default RecentActivity;
