import type { GoalAssignment } from "@/types";

/**
 * Mock AI responses. Used whenever ENABLE_AI_MODERATOR is false so the flows stay testable
 * without an OpenAI key.
 */

export interface MeetingSummary {
  summary: string;
  completed: string[];
  needsSupport: string[];
  suggestedGoals: string[];
}

export interface GeneratedGoal {
  title: string;
  description: string;
}

export interface StudentProgressAnalysis {
  risk: "low" | "medium" | "high";
  notes: string;
}

export interface StudentRisk extends StudentProgressAnalysis {
  userId: string;
  name: string;
}

export interface StudentInput {
  userId: string;
  name: string;
  assignments: GoalAssignment[];
}

export function mockMeetingSummary(transcript: string): MeetingSummary {
  return {
    summary: `Mock summary of a ${transcript.length}-character transcript.`,
    completed: ["Chapters 1-3"],
    needsSupport: ["Genetics concepts"],
    suggestedGoals: ["Review genetics and complete practice problems."],
  };
}

export function mockGoals(): GeneratedGoal[] {
  return [{ title: "Review genetics", description: "Review genetics and complete practice problems." }];
}

export function mockStudentProgress(assignments: GoalAssignment[]): StudentProgressAnalysis {
  const average = assignments.length
    ? assignments.reduce((sum, a) => sum + a.progress, 0) / assignments.length
    : 0;
  return average >= 60
    ? { risk: "low", notes: "Progress is on track." }
    : { risk: "medium", notes: "Consider a check-in or a shorter next goal." };
}

/** Batched twin of mockStudentProgress: one risk line per student, no model call. */
export function mockPointStudents(students: StudentInput[]): StudentRisk[] {
  return students.map((student) => ({
    userId: student.userId,
    name: student.name,
    ...mockStudentProgress(student.assignments),
  }));
}

export function mockMotivation(name: string): string {
  return `${name}, every session you show up for is a step forward. Keep going!`;
}
