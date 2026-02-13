export interface Branch {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  color: string;
}

export const branches: Branch[] = [
  {
    id: "ece",
    name: "Electronics & Communication Engineering",
    code: "ECE",
    description: "Learn signal processing, digital communication, microcontrollers, and VLSI design.",
    icon: "Radio",
    color: "#a78bfa",
  },
  {
    id: "cse",
    name: "Computer Science & Engineering",
    code: "CSE",
    description: "Master software development, AI, web technologies, and cloud computing.",
    icon: "Code2",
    color: "#4ade80",
  },
  {
    id: "ee",
    name: "Electrical Engineering",
    code: "EE",
    description: "Power systems, control systems, electrical machines, and grid technologies.",
    icon: "Zap",
    color: "#fbbf24",
  },
  {
    id: "mechanical",
    name: "Mechanical Engineering",
    code: "ME",
    description: "CAD, thermodynamics, fluid mechanics, and mechanical design.",
    icon: "Cog",
    color: "#f87171",
  },
  {
    id: "civil",
    name: "Civil Engineering",
    code: "CE",
    description: "Structural analysis, concrete design, and construction management.",
    icon: "Building2",
    color: "#818cf8",
  },
  {
    id: "data-science",
    name: "Data Science & Analytics",
    code: "DS",
    description: "Machine learning, data engineering, and business intelligence.",
    icon: "BarChart3",
    color: "#06b6d4",
  },
];

// Map branches to relevant tracks
export const branchTrackMappings: Record<string, string[]> = {
  ece: [
    "digital-communication",
    "microcontroller-systems",
    "verilog-hdl",
    "signal-processing",
    "embedded-systems",
    "advanced-digital",
  ],
  cse: [
    "full-stack-dev",
    "ai-ml",
    "cloud-devops",
    "cybersecurity",
    "data-science",
    "web-technologies",
  ],
  ee: [
    "power-systems",
    "control-systems",
    "electrical-machines",
    "circuit-analysis",
    "digital-communication",
    "signal-processing",
  ],
  mechanical: [
    "cad-modeling",
    "thermodynamics",
    "fluid-mechanics",
    "mechanical-design",
    "materials-science",
    "manufacturing",
  ],
  civil: [
    "structural-analysis",
    "concrete-design",
    "geotechnical-engineering",
    "construction-management",
    "transportation",
    "environmental-engineering",
  ],
  "data-science": [
    "ai-ml",
    "data-science",
    "cloud-devops",
    "python-programming",
    "statistics-analytics",
    "deep-learning",
  ],
};
