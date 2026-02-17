import { practiceTopics, type PracticeLanguage, type PracticeTier, type PracticeTopic } from "@/data/practiceTopics";
import { getLearnerDnaSummary } from "@/services/learnerProfileService";
import { safeStorage } from "@/lib/safeStorage";

const MISSION_STORAGE_PREFIX = "learnpath_daily_mission_";

type MissionTaskKind = "recovery" | "momentum" | "stretch";
type MissionTaskStatus = "pending" | "completed";

export interface MissionTask {
  id: string;
  kind: MissionTaskKind;
  status: MissionTaskStatus;
  title: string;
  description: string;
  reason: string;
  topicId: string;
  language: PracticeLanguage;
  estimatedMinutes: number;
  targetPath: string;
  completedAt?: string;
}

export interface DailyMission {
  id: string;
  userId: string;
  branch: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  adaptiveFocus: string;
  tasks: MissionTask[];
}

const missionStorageKey = (userId: string, date: string): string =>
  `${MISSION_STORAGE_PREFIX}${userId}_${date}`;

const todayKey = (): string => new Date().toISOString().slice(0, 10);

const defaultLanguageByBranch: Record<string, PracticeLanguage[]> = {
  cse: ["javascript", "python", "sql", "verilog"],
  ece: ["verilog", "python", "javascript", "sql"],
  ee: ["python", "verilog", "javascript", "sql"],
  "data-science": ["python", "sql", "javascript", "verilog"],
  mechanical: ["python", "javascript", "sql", "verilog"],
  civil: ["python", "sql", "javascript", "verilog"],
};

const safeReadMission = (userId: string, date: string): DailyMission | null => {
  const rawValue = safeStorage.getItem(missionStorageKey(userId, date));
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as DailyMission;
  } catch {
    return null;
  }
};

const writeMission = (mission: DailyMission): void => {
  safeStorage.setItem(missionStorageKey(mission.userId, mission.date), JSON.stringify(mission));
};

const getBranchLanguagePriority = (branch: string): PracticeLanguage[] =>
  defaultLanguageByBranch[branch] ?? ["javascript", "python", "sql", "verilog"];

const pickTopic = (
  language: PracticeLanguage,
  desiredTier: PracticeTier,
  excluded: Set<string>,
): PracticeTopic => {
  const languageTopics = practiceTopics.filter((topic) => topic.language === language && !excluded.has(topic.id));
  if (languageTopics.length === 0) {
    const fallback = practiceTopics.find((topic) => !excluded.has(topic.id)) ?? practiceTopics[0];
    return fallback;
  }

  const tierMatched = languageTopics.find((topic) => topic.tier === desiredTier);
  return tierMatched ?? languageTopics[0];
};

const buildTask = (
  date: string,
  kind: MissionTaskKind,
  topic: PracticeTopic,
  title: string,
  description: string,
  reason: string,
  estimatedMinutes: number,
): MissionTask => ({
  id: `${date}:${kind}`,
  kind,
  status: "pending",
  title,
  description,
  reason,
  topicId: topic.id,
  language: topic.language,
  estimatedMinutes,
  targetPath: `/practice?topic=${encodeURIComponent(topic.id)}&missionTaskId=${encodeURIComponent(
    `${date}:${kind}`,
  )}`,
});

const createMission = (userId: string, branch: string): DailyMission => {
  const date = todayKey();
  const now = new Date().toISOString();
  const dna = getLearnerDnaSummary(userId, branch);
  const languagePriority = getBranchLanguagePriority(branch);
  const acceptedFocus = dna.focusLanguage as PracticeLanguage | undefined;
  const acceptedStrongest = dna.strongestLanguage as PracticeLanguage | undefined;

  const focusLanguage = acceptedFocus && languagePriority.includes(acceptedFocus)
    ? acceptedFocus
    : languagePriority[0];

  const momentumLanguage = acceptedStrongest && languagePriority.includes(acceptedStrongest)
    ? acceptedStrongest
    : languagePriority.find((language) => language !== focusLanguage) ?? focusLanguage;

  const stretchLanguage =
    languagePriority.find((language) => ![focusLanguage, momentumLanguage].includes(language)) ??
    momentumLanguage;

  const usedTopics = new Set<string>();
  const recoveryTopic = pickTopic(focusLanguage, "foundation", usedTopics);
  usedTopics.add(recoveryTopic.id);
  const momentumTopic = pickTopic(momentumLanguage, "intermediate", usedTopics);
  usedTopics.add(momentumTopic.id);
  const stretchTopic = pickTopic(stretchLanguage, "advanced", usedTopics);

  const mistakeHint = dna.topMistakes[0]?.label ?? "consistency";

  const tasks = [
    buildTask(
      date,
      "recovery",
      recoveryTopic,
      `Recovery Sprint: ${recoveryTopic.title}`,
      `Focus on accuracy in ${focusLanguage.toUpperCase()} to reduce repeat mistakes.`,
      `Adaptive focus: ${mistakeHint}`,
      20,
    ),
    buildTask(
      date,
      "momentum",
      momentumTopic,
      `Momentum Builder: ${momentumTopic.title}`,
      "Run one clean pass and optimize for readability and stable output.",
      `Leaning on your strongest signal: ${(dna.strongestLanguage ?? momentumLanguage).toUpperCase()}`,
      25,
    ),
    buildTask(
      date,
      "stretch",
      stretchTopic,
      `Stretch Challenge: ${stretchTopic.title}`,
      "Push one level up in difficulty and finish with all tests passing.",
      `Growth target in ${stretchLanguage.toUpperCase()} for long-term versatility.`,
      30,
    ),
  ];

  return {
    id: `${userId}:${date}`,
    userId,
    branch,
    date,
    createdAt: now,
    updatedAt: now,
    adaptiveFocus: focusLanguage,
    tasks,
  };
};

export const getTodayMission = (userId: string, branch: string): DailyMission => {
  const date = todayKey();
  const existing = safeReadMission(userId, date);
  if (existing && existing.branch === branch) {
    return existing;
  }

  const generated = createMission(userId, branch);
  writeMission(generated);
  return generated;
};

export const completeTodayMissionTask = (
  userId: string,
  branch: string,
  taskId: string,
): DailyMission => {
  const mission = getTodayMission(userId, branch);
  const targetTask = mission.tasks.find((task) => task.id === taskId);
  if (!targetTask || targetTask.status === "completed") {
    return mission;
  }

  targetTask.status = "completed";
  targetTask.completedAt = new Date().toISOString();
  mission.updatedAt = new Date().toISOString();
  writeMission(mission);
  return mission;
};

export const missionCompletionPercent = (mission: DailyMission): number => {
  if (mission.tasks.length === 0) return 0;
  const completed = mission.tasks.filter((task) => task.status === "completed").length;
  return Math.round((completed / mission.tasks.length) * 100);
};
