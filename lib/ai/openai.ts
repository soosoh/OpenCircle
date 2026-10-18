import { FEATURES } from "@/config/features";
import type { GoalAssignment } from "@/types";
import {
  mockGoals,
  mockMeetingSummary,
  mockMotivation,
  mockStudentProgress,
  type GeneratedGoal,
  type MeetingSummary,
  type StudentProgressAnalysis,
} from "./mock";

export type { GeneratedGoal, MeetingSummary, StudentProgressAnalysis } from "./mock";

/**
 * OpenAI integration (server-only). When ENABLE_AI_MODERATOR is false every function returns
 * mock data and never reads OPENAI_API_KEY. When true, it calls the Chat Completions API.
 * Env: OPENAI_API_KEY (required), OPENAI_MODEL (optional, default "gpt-4o-mini").
 */

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

async function chatJson<T>(system: string, user: string): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set. Set it, or keep ENABLE_AI_MODERATOR false.");

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!response.ok) throw new Error(`OpenAI request failed with status ${response.status}`);

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned an empty response");
  return JSON.parse(content) as T;
}

/** Summarizes a meeting transcript into completed work, support needs, and suggested goals. */
export async function generateMeetingSummary(transcript: string): Promise<MeetingSummary> {
  if (!FEATURES.ENABLE_AI_MODERATOR) return mockMeetingSummary(transcript);
  return chatJson<MeetingSummary>(
    'You are a study-group moderator. Return JSON: {"summary": string, "completed": string[], "needsSupport": string[], "suggestedGoals": string[]}.',
    transcript,
  );
}

/** Proposes next week's goals from a summary of the previous goals. */
export async function generateGoals(context: string): Promise<GeneratedGoal[]> {
  if (!FEATURES.ENABLE_AI_MODERATOR) return mockGoals();
  const result = await chatJson<{ goals: GeneratedGoal[] }>(
    'You are a study-group moderator. Return JSON: {"goals": [{"title": string, "description": string}]} with 1-3 concrete goals for next week.',
    context,
  );
  return result.goals;
}

/** Flags students who may need a check-in. */
export async function analyzeStudentProgress(assignments: GoalAssignment[]): Promise<StudentProgressAnalysis> {
  if (!FEATURES.ENABLE_AI_MODERATOR) return mockStudentProgress(assignments);
  return chatJson<StudentProgressAnalysis>(
    'Return JSON: {"risk": "low" | "medium" | "high", "notes": string} for these goal assignments.',
    JSON.stringify(assignments),
  );
}

/** Short encouraging message for a student. */
export async function generateMotivationMessage(name: string, context: string): Promise<string> {
  if (!FEATURES.ENABLE_AI_MODERATOR) return mockMotivation(name);
  const result = await chatJson<{ message: string }>(
    'You encourage high school and college students in a study group. Return JSON: {"message": string} with one or two warm sentences.',
    `Student: ${name}. Context: ${context}`,
  );
  return result.message;
}
