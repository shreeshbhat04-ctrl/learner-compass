import { beforeEach, describe, expect, it } from "vitest";
import {
  completeTodayMissionTask,
  getTodayMission,
  missionCompletionPercent,
} from "@/services/missionEngine";
import { safeStorage } from "@/lib/safeStorage";

describe("missionEngine", () => {
  beforeEach(() => {
    safeStorage.clear();
  });

  it("generates a daily mission with three adaptive tasks", () => {
    const mission = getTodayMission("mission-user", "cse");

    expect(mission.tasks).toHaveLength(3);
    expect(mission.tasks.every((task) => task.status === "pending")).toBe(true);
    expect(missionCompletionPercent(mission)).toBe(0);
  });

  it("marks mission tasks as completed", () => {
    const mission = getTodayMission("mission-user", "cse");
    const completed = completeTodayMissionTask("mission-user", "cse", mission.tasks[0].id);

    expect(completed.tasks[0].status).toBe("completed");
    expect(missionCompletionPercent(completed)).toBeGreaterThan(0);
  });
});
