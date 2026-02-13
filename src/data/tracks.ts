import { 
  Code2, Radio, Brain, Calculator, Shield, Database, Globe, Cpu
} from "lucide-react";

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: number;
  progress?: number;
}

export interface Track {
  id: string;
  title: string;
  description: string;
  icon: any;
  courseCount: number;
  duration: string;
  level: string;
  color: string;
  courses: Course[];
}

export const tracks: Track[] = [
  {
    id: "full-stack-dev",
    title: "Full-Stack Development",
    description: "Master modern web development from frontend to backend, including React, Node.js, databases, and deployment.",
    icon: Code2,
    courseCount: 8,
    duration: "120 hrs",
    level: "Beginner → Advanced",
    color: "#4ade80",
    courses: [
      { id: "html-css", title: "HTML & CSS Fundamentals", description: "Build the foundation of web development with semantic HTML and modern CSS.", duration: "12 hrs", lessons: 24 },
      { id: "js-basics", title: "JavaScript Essentials", description: "Learn core JavaScript concepts, DOM manipulation, and async programming.", duration: "18 hrs", lessons: 32 },
      { id: "react-dev", title: "React Development", description: "Build dynamic UIs with React, hooks, state management, and component patterns.", duration: "20 hrs", lessons: 28 },
      { id: "node-backend", title: "Backend with Node.js", description: "Create RESTful APIs, handle authentication, and connect databases.", duration: "16 hrs", lessons: 22 },
      { id: "databases", title: "Database Design", description: "Master SQL and NoSQL databases, schema design, and query optimization.", duration: "14 hrs", lessons: 20 },
      { id: "typescript", title: "TypeScript Mastery", description: "Add type safety to your projects with advanced TypeScript patterns.", duration: "12 hrs", lessons: 18 },
      { id: "testing", title: "Testing & Quality", description: "Write unit tests, integration tests, and implement CI/CD pipelines.", duration: "10 hrs", lessons: 16 },
      { id: "deployment", title: "DevOps & Deployment", description: "Deploy applications with Docker, cloud platforms, and monitoring.", duration: "8 hrs", lessons: 14 },
    ],
  },
  {
    id: "digital-communication",
    title: "Digital Communication",
    description: "Explore signal processing, modulation techniques, and MATLAB simulations for modern communication systems.",
    icon: Radio,
    courseCount: 6,
    duration: "90 hrs",
    level: "Intermediate",
    color: "#a78bfa",
    courses: [
      { id: "signals-systems", title: "Signals & Systems", description: "Understand continuous and discrete signals, LTI systems, and convolution.", duration: "18 hrs", lessons: 26 },
      { id: "fourier-analysis", title: "Fourier Analysis", description: "Master Fourier series, transforms, and frequency domain analysis.", duration: "16 hrs", lessons: 22 },
      { id: "filter-design", title: "Digital Filter Design", description: "Design FIR and IIR filters using MATLAB simulations.", duration: "14 hrs", lessons: 20 },
      { id: "modulation", title: "Modulation Techniques", description: "AM, FM, PM, and digital modulation schemes with practical labs.", duration: "16 hrs", lessons: 24 },
      { id: "matlab-sim", title: "MATLAB for Communications", description: "Hands-on MATLAB simulations for signal processing problems.", duration: "14 hrs", lessons: 18 },
      { id: "error-coding", title: "Error Control Coding", description: "Hamming codes, CRC, convolutional codes, and Viterbi decoding.", duration: "12 hrs", lessons: 16 },
    ],
  },
  {
    id: "ai-ml",
    title: "AI & Machine Learning",
    description: "From fundamentals to production: learn machine learning, deep learning, NLP, and model deployment.",
    icon: Brain,
    courseCount: 7,
    duration: "110 hrs",
    level: "Intermediate → Advanced",
    color: "#f97316",
    courses: [
      { id: "python-ml", title: "Python for ML", description: "NumPy, Pandas, and Matplotlib essentials for data science.", duration: "14 hrs", lessons: 22 },
      { id: "ml-fundamentals", title: "ML Fundamentals", description: "Regression, classification, clustering, and model evaluation.", duration: "18 hrs", lessons: 28 },
      { id: "deep-learning", title: "Deep Learning", description: "Neural networks, CNNs, RNNs, and transformers.", duration: "20 hrs", lessons: 26 },
      { id: "nlp", title: "Natural Language Processing", description: "Text processing, sentiment analysis, and language models.", duration: "16 hrs", lessons: 22 },
      { id: "cv", title: "Computer Vision", description: "Image classification, object detection, and image segmentation.", duration: "14 hrs", lessons: 18 },
      { id: "mlops", title: "MLOps & Deployment", description: "Model serving, monitoring, and production pipelines.", duration: "12 hrs", lessons: 16 },
      { id: "gen-ai", title: "Generative AI", description: "GANs, diffusion models, and LLM fine-tuning.", duration: "16 hrs", lessons: 20 },
    ],
  },
  {
    id: "data-science",
    title: "Data Science & Analytics",
    description: "Analyze, visualize, and derive insights from data using Python, SQL, and statistical methods.",
    icon: Calculator,
    courseCount: 5,
    duration: "70 hrs",
    level: "Beginner → Intermediate",
    color: "#06b6d4",
    courses: [
      { id: "stats-basics", title: "Statistics Foundations", description: "Descriptive statistics, probability, distributions, and hypothesis testing.", duration: "14 hrs", lessons: 20 },
      { id: "data-wrangling", title: "Data Wrangling", description: "Clean, transform, and prepare datasets for analysis.", duration: "12 hrs", lessons: 18 },
      { id: "data-viz", title: "Data Visualization", description: "Create compelling visualizations with Matplotlib and Seaborn.", duration: "10 hrs", lessons: 16 },
      { id: "sql-analytics", title: "SQL for Analytics", description: "Advanced SQL queries, window functions, and data modeling.", duration: "14 hrs", lessons: 22 },
      { id: "business-intel", title: "Business Intelligence", description: "Dashboard creation, KPI tracking, and data storytelling.", duration: "10 hrs", lessons: 14 },
    ],
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity",
    description: "Learn ethical hacking, network security, cryptography, and security best practices.",
    icon: Shield,
    courseCount: 5,
    duration: "80 hrs",
    level: "Intermediate",
    color: "#ef4444",
    courses: [
      { id: "sec-fundamentals", title: "Security Fundamentals", description: "CIA triad, threat modeling, and security architecture.", duration: "14 hrs", lessons: 20 },
      { id: "network-sec", title: "Network Security", description: "Firewalls, IDS/IPS, VPNs, and network monitoring.", duration: "16 hrs", lessons: 24 },
      { id: "cryptography", title: "Cryptography", description: "Symmetric/asymmetric encryption, hashing, and PKI.", duration: "14 hrs", lessons: 20 },
      { id: "ethical-hacking", title: "Ethical Hacking", description: "Penetration testing, vulnerability assessment, and tools.", duration: "18 hrs", lessons: 26 },
      { id: "sec-ops", title: "Security Operations", description: "Incident response, SIEM, and security automation.", duration: "12 hrs", lessons: 16 },
    ],
  },
  {
    id: "cloud-devops",
    title: "Cloud & DevOps",
    description: "Master cloud platforms, containerization, infrastructure as code, and CI/CD pipelines.",
    icon: Database,
    courseCount: 5,
    duration: "75 hrs",
    level: "Intermediate",
    color: "#eab308",
    courses: [
      { id: "cloud-basics", title: "Cloud Computing Basics", description: "Cloud models, AWS/GCP/Azure fundamentals, and services.", duration: "14 hrs", lessons: 20 },
      { id: "docker-k8s", title: "Docker & Kubernetes", description: "Containerization, orchestration, and microservices.", duration: "16 hrs", lessons: 24 },
      { id: "iac", title: "Infrastructure as Code", description: "Terraform, CloudFormation, and configuration management.", duration: "14 hrs", lessons: 18 },
      { id: "ci-cd", title: "CI/CD Pipelines", description: "GitHub Actions, Jenkins, and automated deployment.", duration: "12 hrs", lessons: 16 },
      { id: "monitoring", title: "Monitoring & Observability", description: "Prometheus, Grafana, logging, and alerting.", duration: "10 hrs", lessons: 14 },
    ],
  },
];
