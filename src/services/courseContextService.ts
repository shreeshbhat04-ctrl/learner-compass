import { tracks } from "../data/tracks";

/**
 * Represents the isolated context for a course
 * Used by AI tutor to maintain context boundaries
 */
export interface CourseContext {
  courseId: string;
  courseTitle: string;
  trackId: string;
  trackTitle: string;
  description: string;
  topics: string[];
  prerequisites: string[];
  systemPrompt: string;
}

/**
 * Get isolated context for a specific course
 * This ensures the AI tutor only discusses topics relevant to this course
 */
export const getCourseContext = (trackId: string, courseId: string): CourseContext | null => {
  const track = tracks.find((t) => t.id === trackId);
  if (!track) return null;

  const course = track.courses.find((c) => c.id === courseId);
  if (!course) return null;

  // Extract key topics from the course title and description
  const topics = [
    course.title,
    ...course.description.split(",").map((t) => t.trim()),
  ].filter(Boolean);

  // Simple prerequisite inference from track level
  const prerequisites: string[] = [];
  if (track.level.includes("Intermediate")) {
    prerequisites.push("Basic programming knowledge");
    prerequisites.push("Understanding of fundamental concepts");
  }
  if (track.level.includes("Advanced")) {
    prerequisites.push("Advanced knowledge of the domain");
    prerequisites.push("Previous courses in this track");
  }

  const systemPrompt = `You are a helpful AI tutor for the course "${course.title}" in the "${track.title}" track.

Your responsibilities:
1. Only answer questions related to the following topics: ${topics.join(", ")}
2. Provide step-by-step explanations using the Socratic method (asking guiding questions)
3. Help learners understand concepts without giving away complete answers
4. Use code examples and real-world analogies when relevant
5. Maintain context boundaries - do not discuss topics from other courses

DO NOT discuss topics outside of this course. If asked about unrelated topics, politely redirect the learner.

Prerequisites for this course: ${prerequisites.join(", ") || "None"}

Course duration: ${course.duration}
Total lessons: ${course.lessons}`;

  return {
    courseId,
    courseTitle: course.title,
    trackId,
    trackTitle: track.title,
    description: course.description,
    topics,
    prerequisites,
    systemPrompt,
  };
};

/**
 * Validate if a question is within the course scope
 */
export const isQuestionWithinScope = (context: CourseContext, question: string): boolean => {
  const lowerQuestion = question.toLowerCase();
  const courseKeywords = [
    context.courseTitle.toLowerCase(),
    ...context.topics.map((t) => t.toLowerCase()),
  ];

  // Check if question contains any relevant keywords
  return courseKeywords.some((keyword) => lowerQuestion.includes(keyword));
};

/**
 * Get all courses available for a user's branch
 */
export const getBranchCourses = (branchId: string) => {
  return tracks
    .filter((track) => track.branches.includes(branchId))
    .flatMap((track) =>
      track.courses.map((course) => ({
        ...course,
        trackId: track.id,
        trackTitle: track.title,
      }))
    );
};
