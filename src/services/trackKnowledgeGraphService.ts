import type { Track } from "@/data/tracks";
import type { LearnerDnaSummary } from "@/services/learnerProfileService";

export type GraphNodeKind = "track" | "course" | "topic" | "assessment" | "learner";
export type GraphEdgeKind =
  | "has_prerequisite"
  | "taught_in"
  | "related_to"
  | "attempted_by"
  | "performed_at";

export interface TrackGraphNode {
  id: string;
  kind: GraphNodeKind;
  trackId: string;
  label: string;
  labelByLanguage: Record<"en" | "hi" | "ta", string>;
  x: number;
  y: number;
  progress?: number;
  note?: string;
}

export interface TrackGraphEdge {
  id: string;
  kind: GraphEdgeKind;
  source: string;
  target: string;
  weight: number;
  relations: string[];
}

export interface RankedConcept {
  id: string;
  label: string;
  degree: number;
  community: string;
}

export interface TrackGraphResult {
  nodes: TrackGraphNode[];
  edges: TrackGraphEdge[];
  recommendations: string[];
  gaps: string[];
  rankedConcepts: RankedConcept[];
}

const localize = (label: string): Record<"en" | "hi" | "ta", string> => ({
  en: label,
  hi: label
    .replace("Track", "ट्रैक")
    .replace("Course", "कोर्स")
    .replace("Topic", "विषय")
    .replace("Assessment", "आकलन")
    .replace("Learner", "शिक्षार्थी"),
  ta: label
    .replace("Track", "பாதை")
    .replace("Course", "பாடநெறி")
    .replace("Topic", "தலைப்பு")
    .replace("Assessment", "மதிப்பீடு")
    .replace("Learner", "கற்றவர்"),
});

const normalizedProgress = (progress: number | undefined): number => {
  if (typeof progress !== "number") return 0;
  if (Number.isNaN(progress)) return 0;
  return Math.max(0, Math.min(100, progress));
};

export const buildTrackGraph = (
  track: Track,
  options?: {
    learnerName?: string;
    dna?: LearnerDnaSummary;
  },
): TrackGraphResult => {
  const nodes: TrackGraphNode[] = [];
  const edges: TrackGraphEdge[] = [];
  const recommendations: string[] = [];
  const gaps: string[] = [];

  const trackNodeId = `track:${track.id}`;
  nodes.push({
    id: trackNodeId,
    kind: "track",
    trackId: track.id,
    label: `Track: ${track.title}`,
    labelByLanguage: localize(`Track: ${track.title}`),
    x: 10,
    y: 50,
    note: `Isolated context for ${track.title}`,
  });

  const learnerNodeId = `learner:${track.id}`;
  nodes.push({
    id: learnerNodeId,
    kind: "learner",
    trackId: track.id,
    label: `Learner: ${options?.learnerName ?? "You"}`,
    labelByLanguage: localize(`Learner: ${options?.learnerName ?? "You"}`),
    x: 10,
    y: 82,
    progress: normalizedProgress(options?.dna?.acceptanceRate),
    note: "Performance node to connect attempts and recommendations.",
  });
  edges.push({
    id: `${learnerNodeId}->${trackNodeId}:performed_at`,
    kind: "performed_at",
    source: learnerNodeId,
    target: trackNodeId,
    weight: 1,
    relations: ["performed_at"],
  });

  const step = 78 / Math.max(track.courses.length, 1);
  track.courses.forEach((course, index) => {
    const y = 11 + index * step;
    const courseNodeId = `course:${track.id}:${course.id}`;
    const courseProgress = normalizedProgress(course.progress);

    nodes.push({
      id: courseNodeId,
      kind: "course",
      trackId: track.id,
      label: `Course: ${course.title}`,
      labelByLanguage: localize(`Course: ${course.title}`),
      x: 34,
      y,
      progress: courseProgress,
      note: `${course.lessons} lessons • ${course.duration}`,
    });

    edges.push({
      id: `${trackNodeId}->${courseNodeId}:taught_in`,
      kind: "taught_in",
      source: trackNodeId,
      target: courseNodeId,
      weight: 2,
      relations: ["taught_in"],
    });

    if (index > 0) {
      const prevCourseId = `course:${track.id}:${track.courses[index - 1].id}`;
      edges.push({
        id: `${prevCourseId}->${courseNodeId}:has_prerequisite`,
        kind: "has_prerequisite",
        source: prevCourseId,
        target: courseNodeId,
        weight: 3,
        relations: ["has_prerequisite"],
      });
    }

    const conceptNodeId = `topic:${track.id}:${course.id}:concepts`;
    nodes.push({
      id: conceptNodeId,
      kind: "topic",
      trackId: track.id,
      label: `Topic: ${course.title} Concepts`,
      labelByLanguage: localize(`Topic: ${course.title} Concepts`),
      x: 60,
      y: Math.max(6, y - 4),
      note: "Concept hierarchy node.",
    });
    edges.push({
      id: `${courseNodeId}->${conceptNodeId}:related_to`,
      kind: "related_to",
      source: courseNodeId,
      target: conceptNodeId,
      weight: 2,
      relations: ["related_to", "conceptual_proximity"],
    });

    const assessmentNodeId = `assessment:${track.id}:${course.id}`;
    nodes.push({
      id: assessmentNodeId,
      kind: "assessment",
      trackId: track.id,
      label: `Assessment: ${course.title}`,
      labelByLanguage: localize(`Assessment: ${course.title}`),
      x: 84,
      y: Math.min(94, y + 4),
      note: "Practice/quiz performance is attached here.",
    });
    edges.push({
      id: `${conceptNodeId}->${assessmentNodeId}:taught_in`,
      kind: "taught_in",
      source: conceptNodeId,
      target: assessmentNodeId,
      weight: 2,
      relations: ["taught_in", "assessed_by"],
    });
    edges.push({
      id: `${assessmentNodeId}->${learnerNodeId}:attempted_by`,
      kind: "attempted_by",
      source: assessmentNodeId,
      target: learnerNodeId,
      weight: 1,
      relations: ["attempted_by"],
    });

    if (courseProgress < 35) {
      gaps.push(`${course.title}: low progress, revisit prerequisites and practice problems.`);
    }
  });

  if (options?.dna?.focusLanguage) {
    recommendations.push(`Practice in ${options.dna.focusLanguage.toUpperCase()} to reduce failure patterns.`);
  }
  if (options?.dna?.topMistakes.length) {
    recommendations.push(`Address top mistake: ${options.dna.topMistakes[0].label}.`);
  }
  if (!recommendations.length) {
    recommendations.push("Complete the first two courses in sequence to unlock better recommendations.");
  }

  const degreeByNode = new Map<string, number>();
  edges.forEach((edge) => {
    degreeByNode.set(edge.source, (degreeByNode.get(edge.source) ?? 0) + edge.weight);
    degreeByNode.set(edge.target, (degreeByNode.get(edge.target) ?? 0) + edge.weight);
  });

  const rankedConcepts: RankedConcept[] = nodes
    .filter((node) => node.kind === "course" || node.kind === "topic")
    .map((node) => {
      const community = node.kind === "course" ? node.label.replace("Course: ", "") : "Concepts";
      return {
        id: node.id,
        label: node.label,
        degree: degreeByNode.get(node.id) ?? 0,
        community,
      };
    })
    .sort((left, right) => right.degree - left.degree)
    .slice(0, 12);

  return { nodes, edges, recommendations, gaps, rankedConcepts };
};
