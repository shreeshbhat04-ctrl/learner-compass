# Melete: Private-by-Default AI Utilities and Training Platform

## Overview
Melete is our product for the AMD Slingshot contest. It is a practical AI learning and utility platform focused on three outcomes:
- Low-code AI utilities that run efficiently across available hardware.
- Multimodal tools for video-centric and document-centric learning workflows.
- Local-first and private-by-default deployment patterns for student and campus environments.

This repository contains Melete application components plus implementation references for expanding into a full AMD-aligned education and skilling stack.

## Metrics-First Definition of Success
All major decisions in this project are evaluated through measurable outcomes.

### Product and Adoption Metrics
| Metric | What it measures | Target |
| --- | --- | --- |
| Weekly active learners (WAL) | Real student usage consistency | 1,000+ in pilot campus rollout |
| Time to first useful utility | Onboarding friction for low-code builders | Less than 30 minutes |
| Utility completion rate | % of users finishing an end-to-end AI utility | More than 70% |
| 30-day retention | Repeat engagement after first month | More than 40% |

### Learning and Skilling Metrics
| Metric | What it measures | Target |
| --- | --- | --- |
| Course completion uplift | Completion change vs baseline cohort | +20% |
| Concept mastery score | Performance on rubric-based assessments | More than 80% average |
| Practice-to-pass ratio | Attempts required before passing tasks | Improve by 25% |
| Streak continuity | Daily learning consistency | More than 50% keep 7+ day streaks |

### AI Quality and Grounding Metrics
| Metric | What it measures | Target |
| --- | --- | --- |
| Grounded response rate | Answers supported by indexed course sources | More than 95% |
| Hallucination incidence | Unsupported or incorrect assistant outputs | Less than 3% |
| Citation coverage | Responses with traceable sources | More than 90% |
| Feedback relevance score | Faculty/mentor rating for coaching quality | More than 4.2/5 |

### Platform Reliability and Performance Metrics
| Metric | What it measures | Target |
| --- | --- | --- |
| API success rate | Request reliability across core endpoints | More than 99.5% |
| P95 response latency | End-user responsiveness | Less than 800 ms (non-execution APIs) |
| Code execution completion rate | Stable execution in lab workflows | More than 98% |
| Uptime | Service availability | 99.9% |

### Privacy and Responsible AI Metrics
| Metric | What it measures | Target |
| --- | --- | --- |
| Local-processing coverage | % of sensitive workloads processed locally/private infra | More than 85% |
| Encryption coverage | Protected data paths (at rest + in transit) | 100% |
| Policy violation rate | Unsafe/non-compliant response incidence | Less than 1% |
| Audit pass rate | Internal security and privacy checks | 100% critical controls passed |

## Vision and Essence
### 1) Low-code utilities, video/multimodal tools, and local privacy
- Build AI tools that are accessible to students and builders without deep systems programming.
- Enable multimodal workflows (video, text, and code) for real project delivery.
- Keep sensitive learner data and institutional content protected by default.

### 2) AI in education and skilling
- Support study planners, concept coaches, and rubric-aware assistants.
- Ground assistant responses in course-approved content to reduce hallucinations.
- Keep the platform responsive at scale for labs, clubs, and campus-wide usage.

## AMD AI Solution Blueprint
The following AMD-oriented components define the target architecture and training emphasis.

| Component | Why it fits | Capability for this project | Primary KPI | Integration status |
| --- | --- | --- | --- | --- |
| Lemonade SDK (LLM-Aid, TurnkeyML) | Enables low/no-code AI utility development through a unified API layer. | Routes workloads to NPU, iGPU, or CPU automatically so builders can focus on product logic instead of hardware orchestration. | Time to first useful utility; utility completion rate | Planned architecture track |
| GAIA Clip Agent | Direct fit for multimodal creativity and learning workflows. | YouTube search + Q&A workflows for creator research, classroom references, and fast content summarization. | Video-to-summary time; creator task completion rate | Planned architecture track |
| AMD Infinity Guard | Core for responsible GenAI and privacy-first design. | Hardware-level protections (encryption/isolation) for models, learner data, and institutional content. | Encryption coverage; policy violation rate | Security baseline target |
| LlamaIndex RAG pipeline (within GAIA workflows) | Foundation for concept coaching and grounded tutoring. | Indexes textbooks, PDFs, and repositories for course-anchored answers with strong relevance controls. | Grounded response rate; hallucination incidence | Planned architecture track |
| Pensando DPUs | Important for scale, reliability, and secure data movement. | Offloads network and security processing so CPUs remain focused on AI inference and coaching workloads. | P95 latency under load; API success rate | Scale-out architecture track |

## Training and Skilling Focus
### Concept coaches and rubric-aware feedback
- Build tutors that answer only from approved uploaded material.
- Provide structured feedback against course rubrics.
- Improve trust by linking responses to indexed sources.

### Study planners and multimodal support
- Use learning context (progress, weak areas, goals) to plan daily tasks.
- Combine text, video, and coding exercises into a single path.
- Support rapid revision using video Q&A and concise summaries.

### Campus-life and large-user readiness
- Design for high concurrency and reliable response times.
- Separate AI inference workloads from network/security heavy tasks.
- Keep privacy and compliance constraints embedded in system design.

## Repository Structure
- `learner-compass/`: Main learning platform (frontend + backend).
- `knowledge_graph_ref/`: Knowledge graph reference workflow and graph extraction exploration.
- `implementation_plan.md`: Implementation roadmap and architecture notes.
- `task.md`: Detailed task breakdown and execution checklist.

## Current Implemented Capabilities
Current implemented features are primarily in `learner-compass/`:
- Full-stack learning experience with React + TypeScript frontend and Fastify backend.
- Ranked search across tracks/courses with filtering, fuzzy matching, and caching.
- Multi-language coding practice flow with backend execution API support.
- Adaptive mission flows, learner profile insights, and hint-first coaching endpoints.
- Personalized educational video recommendation pipeline and fallback behavior.

## Target Architecture
1. User interacts through learner-facing apps (planning, coaching, coding, video workflows).
2. AI orchestration layer routes tasks and retrieval calls.
3. Grounding pipeline indexes institutional/course content for constrained answers.
4. Compute routing layer selects best available hardware (NPU/iGPU/CPU).
5. Security and platform layer enforces isolation, encryption, and policy controls.
6. Scale layer supports high-concurrency campus deployments.

## Private-by-Default Design Principles
- Keep retrieval indexes and sensitive content local when policy requires it.
- Apply least-privilege and encryption controls across model + data paths.
- Store only required telemetry for quality and reliability.
- Isolate inference and execution environments for student safety.

## Roadmap Priorities
1. Integrate low-code orchestration path for hardware-aware execution.
2. Expand GAIA-style multimodal agent workflows for classroom and creator use.
3. Add grounded RAG coaching mode for faculty-approved content sets.
4. Formalize security controls aligned with private-by-default standards.
5. Prepare scale architecture for multi-tenant campus deployments.

## Getting Started
### Learner Compass
```bash
cd learner-compass
npm install
npm run server:dev
npm run dev
```

### Knowledge Graph Reference
Follow local instructions in `knowledge_graph_ref/README.md` for Docker-based setup.

## Validation and Quality
Recommended validation flow for `learner-compass`:
```bash
cd learner-compass
npm test
npm run build
```

## Who This Is For
- Student builders creating practical AI utilities.
- Faculty and mentors building grounded concept-coaching workflows.
- Campus tech teams deploying privacy-sensitive AI education tools.
- Developer clubs prototyping multimodal learning assistants.

## License and Contribution
Add your preferred license file and contribution policy before external distribution.

For feature proposals, use `task.md` and `implementation_plan.md` to map scope, risk, and rollout order.
