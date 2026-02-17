// Progress and Gamification Service
// Handles XP, streaks, progress tracking, and achievements

export interface UserProgress {
  xp: number;
  streak: number;
  lastLoginDate: string; // ISO date string
  lastActivityDate: string; // ISO date string
  completedExercises: string[]; // Array of exercise IDs
  courseProgress: Record<string, number>; // courseId -> progress percentage
  trackProgress: Record<string, number>; // trackId -> progress percentage
  achievements: string[]; // Array of achievement IDs
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'exercise' | 'course' | 'login' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  xpGained?: number;
}

const STORAGE_KEY = 'learner_compass_progress';
const XP_VALUES = {
  easy: 10,
  medium: 25,
  hard: 50,
  course_completion: 100,
  streak_milestone: 50,
};

// Initialize or get user progress
export const getProgress = (userId: string): UserProgress => {
  const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
  if (stored) {
    return JSON.parse(stored);
  }

  const defaultProgress: UserProgress = {
    xp: 0,
    streak: 0,
    lastLoginDate: new Date().toISOString(),
    lastActivityDate: new Date().toISOString(),
    completedExercises: [],
    courseProgress: {},
    trackProgress: {},
    achievements: [],
    recentActivity: [],
  };

  saveProgress(userId, defaultProgress);
  return defaultProgress;
};

// Save progress to localStorage
export const saveProgress = (userId: string, progress: UserProgress): void => {
  localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(progress));
};

// Update streak on login
export const updateStreak = (userId: string): number => {
  const progress = getProgress(userId);
  const today = new Date().toISOString().split('T')[0];
  const lastLogin = progress.lastLoginDate.split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastLogin === today) {
    // Already logged in today
    return progress.streak;
  } else if (lastLogin === yesterdayStr) {
    // Consecutive day
    progress.streak += 1;
  } else {
    // Streak broken
    progress.streak = 1;
  }

  progress.lastLoginDate = new Date().toISOString();
  saveProgress(userId, progress);

  // Check for streak milestones
  checkStreakMilestones(userId, progress.streak);

  return progress.streak;
};

// Add XP and update progress
export const addXP = (
  userId: string,
  amount: number,
  reason: string,
  activityType: ActivityItem['type'] = 'exercise'
): number => {
  const progress = getProgress(userId);
  progress.xp += amount;
  progress.lastActivityDate = new Date().toISOString();

  // Add to recent activity
  const activity: ActivityItem = {
    id: Date.now().toString(),
    type: activityType,
    title: reason,
    description: `Gained ${amount} XP`,
    timestamp: new Date().toISOString(),
    xpGained: amount,
  };

  progress.recentActivity.unshift(activity);
  // Keep only last 20 activities
  if (progress.recentActivity.length > 20) {
    progress.recentActivity = progress.recentActivity.slice(0, 20);
  }

  saveProgress(userId, progress);
  checkAchievements(userId, progress);
  return progress.xp;
};

// Complete an exercise
export const completeExercise = (
  userId: string,
  exerciseId: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  courseId?: string,
  trackId?: string
): void => {
  const progress = getProgress(userId);

  // Check if already completed
  if (progress.completedExercises.includes(exerciseId)) {
    return;
  }

  // Add to completed exercises
  progress.completedExercises.push(exerciseId);

  // Award XP
  const xpGained = XP_VALUES[difficulty];
  addXP(userId, xpGained, `Completed ${difficulty} exercise`, 'exercise');

  // Update course progress
  if (courseId) {
    const currentProgress = progress.courseProgress[courseId] || 0;
    // Increment by a small amount (you can adjust this logic)
    progress.courseProgress[courseId] = Math.min(currentProgress + 10, 100);
  }

  // Update track progress
  if (trackId) {
    const currentProgress = progress.trackProgress[trackId] || 0;
    progress.trackProgress[trackId] = Math.min(currentProgress + 5, 100);
  }

  saveProgress(userId, progress);
};

// Check for streak milestones
const checkStreakMilestones = (userId: string, streak: number): void => {
  const milestones = [7, 14, 30, 60, 100];
  if (milestones.includes(streak)) {
    addXP(userId, XP_VALUES.streak_milestone, `${streak} day streak!`, 'achievement');
  }
};

// Check for achievements
const checkAchievements = (userId: string, progress: UserProgress): void => {
  const achievements: Array<{ id: string; condition: (p: UserProgress) => boolean; name: string }> = [
    {
      id: 'first_exercise',
      condition: (p) => p.completedExercises.length >= 1,
      name: 'First Steps',
    },
    {
      id: 'ten_exercises',
      condition: (p) => p.completedExercises.length >= 10,
      name: 'Getting Started',
    },
    {
      id: 'fifty_exercises',
      condition: (p) => p.completedExercises.length >= 50,
      name: 'Dedicated Learner',
    },
    {
      id: 'hundred_xp',
      condition: (p) => p.xp >= 100,
      name: 'Century Club',
    },
    {
      id: 'thousand_xp',
      condition: (p) => p.xp >= 1000,
      name: 'XP Master',
    },
    {
      id: 'week_streak',
      condition: (p) => p.streak >= 7,
      name: 'Week Warrior',
    },
    {
      id: 'month_streak',
      condition: (p) => p.streak >= 30,
      name: 'Monthly Master',
    },
  ];

  achievements.forEach((achievement) => {
    if (
      !progress.achievements.includes(achievement.id) &&
      achievement.condition(progress)
    ) {
      progress.achievements.push(achievement.id);
      addXP(userId, 25, `Achievement: ${achievement.name}`, 'achievement');
      saveProgress(userId, progress);
    }
  });
};

// Get course progress
export const getCourseProgress = (userId: string, courseId: string): number => {
  const progress = getProgress(userId);
  return progress.courseProgress[courseId] || 0;
};

// Get track progress
export const getTrackProgress = (userId: string, trackId: string): number => {
  const progress = getProgress(userId);
  return progress.trackProgress[trackId] || 0;
};

// Get recent activity
export const getRecentActivity = (userId: string, limit: number = 10): ActivityItem[] => {
  const progress = getProgress(userId);
  return progress.recentActivity.slice(0, limit);
};

// Get achievements
export const getAchievements = (userId: string): string[] => {
  const progress = getProgress(userId);
  return progress.achievements;
};

// Get achievement details
export const getAchievementDetails = (achievementId: string): { name: string; description: string; icon: string } => {
  const achievements: Record<string, { name: string; description: string; icon: string }> = {
    first_exercise: {
      name: 'First Steps',
      description: 'Completed your first exercise',
      icon: '🎯',
    },
    ten_exercises: {
      name: 'Getting Started',
      description: 'Completed 10 exercises',
      icon: '🚀',
    },
    fifty_exercises: {
      name: 'Dedicated Learner',
      description: 'Completed 50 exercises',
      icon: '⭐',
    },
    hundred_xp: {
      name: 'Century Club',
      description: 'Earned 100 XP',
      icon: '💯',
    },
    thousand_xp: {
      name: 'XP Master',
      description: 'Earned 1000 XP',
      icon: '👑',
    },
    week_streak: {
      name: 'Week Warrior',
      description: '7 day streak',
      icon: '🔥',
    },
    month_streak: {
      name: 'Monthly Master',
      description: '30 day streak',
      icon: '🏆',
    },
  };

  return achievements[achievementId] || { name: 'Unknown', description: '', icon: '🏅' };
};
