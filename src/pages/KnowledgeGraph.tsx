import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Languages, Lightbulb, Loader2, Network } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { getTracksByBranch } from "@/services/trackService";
import { getLearnerDnaSummary, getLearnerProfile } from "@/services/learnerProfileService";
import { listTechViseThreads, getTechViseLeaderboard } from "@/services/techviseService";
import {
  fetchLearningKnowledgeGraph,
  type LearningKnowledgeGraphResponse,
} from "@/services/knowledgeGraphService";
import {
  buildTrackGraph,
  type GraphEdgeKind,
} from "@/services/trackKnowledgeGraphService";

type UiLanguage = "en" | "hi" | "ta";

type VisualNodeKind = "track" | "course" | "topic" | "assessment" | "learner" | "context";

interface VisualNode {
  id: string;
  kind: VisualNodeKind;
  label: string;
  labelByLanguage: Record<UiLanguage, string>;
  x: number;
  y: number;
  progress?: number;
  note?: string;
  weight?: number;
}

interface VisualEdge {
  id: string;
  kind: GraphEdgeKind;
  source: string;
  target: string;
  weight: number;
  relations: string[];
}

interface VisualGraph {
  nodes: VisualNode[];
  edges: VisualEdge[];
  recommendations: string[];
  gaps: string[];
  rankedConcepts: Array<{ id: string; label: string; degree: number; community: string }>;
}

const NODE_STYLE: Record<VisualNodeKind, string> = {
  track: "border-emerald-200 bg-emerald-500 text-white",
  course: "border-blue-200 bg-blue-500 text-white",
  topic: "border-amber-200 bg-amber-500 text-white",
  assessment: "border-violet-200 bg-violet-500 text-white",
  learner: "border-slate-200 bg-slate-700 text-white",
  context: "border-zinc-200 bg-zinc-600 text-white",
};

const EDGE_COLOR: Record<GraphEdgeKind, string> = {
  has_prerequisite: "#22c55e",
  taught_in: "#38bdf8",
  related_to: "#f59e0b",
  attempted_by: "#a78bfa",
  performed_at: "#64748b",
};

const localizeLabel = (label: string): Record<UiLanguage, string> => ({
  en: label,
  hi: label
    .replace("Learner", "शिक्षार्थी")
    .replace("Branch", "शाखा")
    .replace("Language", "भाषा")
    .replace("Problem", "प्रश्न")
    .replace("Topic", "विषय")
    .replace("Mistake", "गलती")
    .replace("Company", "कंपनी"),
  ta: label
    .replace("Learner", "கற்றவர்")
    .replace("Branch", "பிரிவு")
    .replace("Language", "மொழி")
    .replace("Problem", "பிரச்சனை")
    .replace("Topic", "தலைப்பு")
    .replace("Mistake", "பிழை")
    .replace("Company", "நிறுவனம்"),
});

const mapRelationToEdgeKind = (relation: string): GraphEdgeKind => {
  const normalized = relation.toLowerCase();
  if (normalized.includes("attempt") || normalized.includes("solved")) return "attempted_by";
  if (normalized.includes("struggles") || normalized.includes("shows-up")) return "related_to";
  if (normalized.includes("belongs-to") || normalized.includes("implemented")) return "taught_in";
  if (normalized.includes("focus") || normalized.includes("strongest")) return "performed_at";
  if (normalized.includes("cross-train")) return "has_prerequisite";
  return "related_to";
};

const mapNodeTypeToKind = (type: string): VisualNodeKind => {
  if (type === "learner") return "learner";
  if (type === "topic") return "topic";
  if (type === "problem") return "assessment";
  if (type === "branch") return "track";
  if (type === "language") return "course";
  return "context";
};

const laneX = (type: string): number => {
  const lanes: Record<string, number> = {
    learner: 10,
    branch: 22,
    language: 35,
    mistake: 50,
    problem: 63,
    topic: 77,
    "tech-tag": 88,
    company: 94,
  };
  return lanes[type] ?? 50;
};

const adaptLiveGraph = (live: LearningKnowledgeGraphResponse): VisualGraph => {
  const sortedNodes = [...live.nodes].sort((a, b) => b.weight - a.weight).slice(0, 100);
  const activeIds = new Set(sortedNodes.map((node) => node.id));

  const filteredEdges = live.edges
    .filter((edge) => activeIds.has(edge.source) && activeIds.has(edge.target))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 220);

  const edges: VisualEdge[] = filteredEdges.map((edge, index) => ({
    id: `live:${index}:${edge.source}:${edge.target}:${edge.relation}`,
    kind: mapRelationToEdgeKind(edge.relation),
    source: edge.source,
    target: edge.target,
    weight: edge.weight,
    relations: [edge.relation],
  }));

  const byType = new Map<string, typeof sortedNodes>();
  sortedNodes.forEach((node) => {
    const list = byType.get(node.type) ?? [];
    list.push(node);
    byType.set(node.type, list);
  });
  byType.forEach((nodes) => nodes.sort((a, b) => b.weight - a.weight));

  const nodes: VisualNode[] = [];
  byType.forEach((groupNodes, type) => {
    const total = groupNodes.length;
    groupNodes.forEach((node, index) => {
      const y = total <= 1 ? 50 : 8 + (index * 84) / (total - 1);
      nodes.push({
        id: node.id,
        kind: mapNodeTypeToKind(type),
        label: node.label,
        labelByLanguage: localizeLabel(node.label),
        x: laneX(type),
        y,
        progress: type === "learner" ? Math.max(0, Math.min(100, node.weight)) : undefined,
        note: `Type: ${type} • weight: ${node.weight}`,
        weight: node.weight,
      });
    });
  });

  const degreeByNode = new Map<string, number>();
  edges.forEach((edge) => {
    degreeByNode.set(edge.source, (degreeByNode.get(edge.source) ?? 0) + edge.weight);
    degreeByNode.set(edge.target, (degreeByNode.get(edge.target) ?? 0) + edge.weight);
  });

  const rankedConcepts = nodes
    .filter((node) => node.kind === "topic" || node.kind === "assessment" || node.kind === "course")
    .map((node) => ({
      id: node.id,
      label: node.label,
      degree: degreeByNode.get(node.id) ?? 0,
      community: node.kind,
    }))
    .sort((a, b) => b.degree - a.degree)
    .slice(0, 12);

  return {
    nodes,
    edges,
    recommendations: live.insights.recommendations,
    gaps: live.insights.weaknesses,
    rankedConcepts,
  };
};

const KnowledgeGraphPage = () => {
  const { user } = useAuth();
  const tracks = getTracksByBranch(user?.branch);
  const [selectedTrackId, setSelectedTrackId] = useState(tracks[0]?.id ?? "");
  const [language, setLanguage] = useState<UiLanguage>("en");
  const [edgeFilter, setEdgeFilter] = useState<GraphEdgeKind | "all">("all");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [liveGraph, setLiveGraph] = useState<LearningKnowledgeGraphResponse | null>(null);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  const selectedTrack = tracks.find((track) => track.id === selectedTrackId) ?? tracks[0];
  const dna = user && selectedTrack ? getLearnerDnaSummary(user.id, user.branch) : undefined;
  const localGraph = useMemo(() => {
    if (!selectedTrack) {
      return null;
    }
    return buildTrackGraph(selectedTrack, {
      learnerName: user?.name,
      dna,
    });
  }, [dna, selectedTrack, user?.name]);

  useEffect(() => {
    if (!user) {
      setLiveGraph(null);
      setLiveError(null);
      return;
    }

    let cancelled = false;
    const loadLiveGraph = async () => {
      setIsLiveLoading(true);
      setLiveError(null);
      try {
        const learnerProfile = getLearnerProfile(user.id, user.branch);
        const threads = listTechViseThreads();
        const leaderboard = getTechViseLeaderboard({
          id: user.id,
          name: user.name,
          branch: user.branch,
        });
        const techViseTags = Array.from(
          new Set(
            threads
              .flatMap((thread) => thread.tags)
              .map((tag) => tag.trim().toLowerCase())
              .filter((tag) => tag.length > 1),
          ),
        ).slice(0, 24);
        const targetCompanies = Array.from(
          new Set(
            leaderboard
              .filter((entry) => entry.isCompanyEngineer && Boolean(entry.company))
              .map((entry) => entry.company?.trim() ?? "")
              .filter((company) => company.length > 0),
          ),
        ).slice(0, 10);

        const response = await fetchLearningKnowledgeGraph({
          userId: user.id,
          name: user.name,
          branch: user.branch,
          strongestLanguage: dna?.strongestLanguage,
          focusLanguage: dna?.focusLanguage,
          topMistakes: dna?.topMistakes.map((mistake) => ({
            label: mistake.label,
            count: mistake.count,
          })) ?? [],
          recentSessions: learnerProfile.recentSessions.slice(0, 25).map((session) => ({
            problemId: session.problemId,
            problemTitle: session.problemTitle,
            topicId: session.topicId,
            topicTitle: session.topicTitle,
            language: session.language,
            passedTests: session.passedTests,
            totalTests: session.totalTests,
            tookMs: session.tookMs,
          })),
          techViseTags,
          targetCompanies,
          solvedProblems: dna?.solvedProblems,
          totalRuns: dna?.totalRuns,
          acceptanceRate: dna?.acceptanceRate,
        });

        if (cancelled) return;
        setLiveGraph(response);
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "Live knowledge graph is unavailable.";
        setLiveError(message);
        setLiveGraph(null);
      } finally {
        if (!cancelled) {
          setIsLiveLoading(false);
        }
      }
    };

    void loadLiveGraph();
    return () => {
      cancelled = true;
    };
  }, [dna?.acceptanceRate, dna?.focusLanguage, dna?.solvedProblems, dna?.strongestLanguage, dna?.topMistakes, dna?.totalRuns, user]);

  const graph = useMemo<VisualGraph | null>(() => {
    if (liveGraph) {
      return adaptLiveGraph(liveGraph);
    }
    if (!localGraph) {
      return null;
    }
    return {
      nodes: localGraph.nodes.map((node) => ({
        id: node.id,
        kind: node.kind,
        label: node.label,
        labelByLanguage: node.labelByLanguage,
        x: node.x,
        y: node.y,
        progress: node.progress,
        note: node.note,
      })),
      edges: localGraph.edges,
      recommendations: localGraph.recommendations,
      gaps: localGraph.gaps,
      rankedConcepts: localGraph.rankedConcepts,
    };
  }, [liveGraph, localGraph]);

  if (!selectedTrack || !graph) {
    return (
      <div className="min-h-screen bg-background pb-16 pt-24">
        <div className="container">
          <Card className="border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">No track data available for this branch.</p>
          </Card>
        </div>
      </div>
    );
  }

  const edgeList =
    edgeFilter === "all" ? graph.edges : graph.edges.filter((edge) => edge.kind === edgeFilter);
  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));
  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) : undefined;
  const rankedConcepts = graph.rankedConcepts;

  const activeConceptId = selectedConceptId ?? rankedConcepts[0]?.id ?? null;
  const activeConcept = activeConceptId ? nodeMap.get(activeConceptId) : undefined;
  const conceptNeighbors = activeConceptId
    ? graph.edges
        .filter((edge) => edge.source === activeConceptId || edge.target === activeConceptId)
        .map((edge) => {
          const neighborId = edge.source === activeConceptId ? edge.target : edge.source;
          return { edge, node: nodeMap.get(neighborId) };
        })
        .filter((entry) => entry.node)
    : [];

  const width = 1000;
  const height = Math.max(640, graph.nodes.length * 22);
  const toX = (x: number) => (x / 100) * width;
  const toY = (y: number) => (y / 100) * height;

  return (
    <div className="min-h-screen bg-background pb-16 pt-24">
      <div className="container space-y-6">
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Knowledge Graph Explorer</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Visualize prerequisites, dependencies, and learner links inside each track.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1.5">
              <Network className="h-3.5 w-3.5" />
              Track Isolated
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <Languages className="h-3.5 w-3.5" />
              Multilingual Labels
            </Badge>
            <Badge variant={liveGraph ? "default" : "secondary"}>
              {liveGraph ? "Live API Graph" : "Local Fallback Graph"}
            </Badge>
          </div>
        </section>

        <Card className="border border-border bg-card p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Select value={selectedTrack.id} onValueChange={setSelectedTrackId}>
              <SelectTrigger>
                <SelectValue placeholder="Select track" />
              </SelectTrigger>
              <SelectContent>
                {tracks.map((track) => (
                  <SelectItem key={track.id} value={track.id}>
                    {track.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={language} onValueChange={(value) => setLanguage(value as UiLanguage)}>
              <SelectTrigger>
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="ta">Tamil</SelectItem>
              </SelectContent>
            </Select>

            <Select value={edgeFilter} onValueChange={(value) => setEdgeFilter(value as GraphEdgeKind | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Relationship filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All relationships</SelectItem>
                <SelectItem value="has_prerequisite">has_prerequisite</SelectItem>
                <SelectItem value="taught_in">taught_in</SelectItem>
                <SelectItem value="related_to">related_to</SelectItem>
                <SelectItem value="attempted_by">attempted_by</SelectItem>
                <SelectItem value="performed_at">performed_at</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(isLiveLoading || liveError) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {isLiveLoading && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading live graph...
                </span>
              )}
              {liveError && (
                <span className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-yellow-700">
                  {liveError} - showing local fallback graph.
                </span>
              )}
            </div>
          )}
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
          <Card className="overflow-x-auto border border-border bg-card p-4">
            <div className="relative min-w-[1000px]" style={{ height }}>
              <svg className="absolute inset-0 h-full w-full">
                {edgeList.map((edge) => {
                  const source = nodeMap.get(edge.source);
                  const target = nodeMap.get(edge.target);
                  if (!source || !target) {
                    return null;
                  }
                  return (
                    <line
                      key={edge.id}
                      x1={toX(source.x)}
                      y1={toY(source.y)}
                      x2={toX(target.x)}
                      y2={toY(target.y)}
                      stroke={EDGE_COLOR[edge.kind]}
                      strokeWidth={2}
                      strokeOpacity={0.8}
                    />
                  );
                })}
              </svg>

              {graph.nodes.map((node, index) => (
                <motion.button
                  key={node.id}
                  type="button"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`absolute max-w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-lg border px-3 py-2 text-left text-xs shadow-md transition-transform hover:scale-[1.03] ${NODE_STYLE[node.kind]} ${
                    selectedNodeId === node.id ? "ring-2 ring-primary ring-offset-2" : ""
                  }`}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <p className="font-semibold leading-tight">{node.labelByLanguage[language]}</p>
                  {typeof node.progress === "number" && (
                    <p className="mt-1 text-[11px] opacity-90">Progress: {node.progress}%</p>
                  )}
                </motion.button>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="border border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Concept Explorer</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Select a high-centrality concept to expand related sub-concepts and assessments.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {rankedConcepts.map((concept) => (
                  <button
                    key={concept.id}
                    type="button"
                    onClick={() => setSelectedConceptId(concept.id)}
                    className={`rounded-md border px-2 py-1 text-xs transition-colors ${
                      activeConceptId === concept.id
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {concept.label.replace("Course: ", "").replace("Topic: ", "")} ({concept.degree})
                  </button>
                ))}
              </div>

              {activeConcept && (
                <div className="mt-3 space-y-2 rounded-md border border-border bg-background p-3">
                  <p className="text-sm font-semibold text-foreground">{activeConcept.labelByLanguage[language]}</p>
                  <div className="space-y-1">
                    {conceptNeighbors.slice(0, 6).map((entry) => (
                      <p key={entry.edge.id} className="text-xs text-muted-foreground">
                        {entry.node?.label} via {entry.edge.kind} (w={entry.edge.weight})
                      </p>
                    ))}
                    {!conceptNeighbors.length && (
                      <p className="text-xs text-muted-foreground">No adjacent concepts yet.</p>
                    )}
                  </div>
                </div>
              )}
            </Card>

            <Card className="border border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Selected Node</p>
              {selectedNode ? (
                <div className="mt-2 space-y-2">
                  <p className="text-sm font-semibold text-foreground">{selectedNode.labelByLanguage[language]}</p>
                  <p className="text-xs text-muted-foreground">{selectedNode.note ?? "No metadata."}</p>
                  {typeof selectedNode.progress === "number" && (
                    <>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{selectedNode.progress}%</span>
                      </div>
                      <Progress value={selectedNode.progress} />
                    </>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Click a node to inspect details.</p>
              )}
            </Card>

            <Card className="border border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-semibold text-foreground">Recommendations</p>
              </div>
              <div className="space-y-2">
                {graph.recommendations.map((item) => (
                  <p key={item} className="text-sm text-muted-foreground">
                    {item}
                  </p>
                ))}
              </div>
              <Button asChild className="mt-3 w-full">
                <Link to={`/tracks/${selectedTrack.id}`}>Open Track Plan</Link>
              </Button>
            </Card>

            <Card className="border border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                <p className="text-sm font-semibold text-foreground">Knowledge Gaps</p>
              </div>
              {graph.gaps.length ? (
                <div className="space-y-2">
                  {graph.gaps.slice(0, 5).map((item) => (
                    <p key={item} className="text-sm text-muted-foreground">
                      {item}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No high-risk gap detected yet.</p>
              )}
            </Card>

            <Card className="border border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Query Templates</p>
              <pre className="mt-2 rounded-md bg-muted/40 p-2 text-[11px] text-foreground">{`MATCH (c:Course {id: $courseId})-[:has_prerequisite*]->(pre:Course)
RETURN pre.id, pre.title;`}</pre>
              <pre className="mt-2 rounded-md bg-muted/40 p-2 text-[11px] text-foreground">{`SELECT course_id, progress
FROM learner_course_progress
WHERE learner_id = $1
ORDER BY progress ASC;`}</pre>
              <pre className="mt-2 rounded-md bg-muted/40 p-2 text-[11px] text-foreground">{`MATCH (a)-[r]->(b)
RETURN a.id, b.id, type(r), r.weight
ORDER BY r.weight DESC;`}</pre>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphPage;
