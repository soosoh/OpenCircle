import { FEATURES } from "@/config/features";
import type { GoalAssignment } from "@/types";
import {
  mockGoals,
  mockMeetingSummary,
  mockMotivation,
  mockPointStudents,
  mockStudentProgress,
  type GeneratedGoal,
  type MeetingSummary,
  type StudentInput,
  type StudentProgressAnalysis,
  type StudentRisk,
} from "./mock";

export type {
  GeneratedGoal,
  MeetingSummary,
  StudentInput,
  StudentProgressAnalysis,
  StudentRisk,
} from "./mock";

/**
 * AI moderator (server-only). Any OpenAI-compatible Chat Completions endpoint works:
 * OpenRouter, OpenAI, or a local server. Set AI_BASE_URL / AI_API_KEY / AI_MODEL.
 * The older OPENAI_API_KEY / OPENAI_MODEL names are still accepted.
 *
 * When ENABLE_AI_MODERATOR is false every function returns mock data, reads no env vars
 * and makes no network call, so the app runs with zero configuration.
 */

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
const FREE_MODEL = "openrouter/free";
const REQUEST_TIMEOUT_MS = 45_000;

function liveEndpoint(): { url: string; apiKey: string; model: string } | null {
  const baseUrl = process.env.AI_BASE_URL ?? process.env.OPENAI_BASE_URL ?? "";
  const apiKey = process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY ?? "";
  if (!apiKey) return null;

  const isOpenRouter = baseUrl.includes("openrouter.ai");
  const model = process.env.AI_MODEL ?? process.env.OPENAI_MODEL ?? (isOpenRouter ? FREE_MODEL : DEFAULT_MODEL);
  const url = baseUrl ? `${baseUrl.replace(/\/$/, "")}/chat/completions` : OPENAI_URL;
  return { url, apiKey, model };
}

function missingKeyError(): Error {
  return new Error(
    "No AI key configured. Set AI_API_KEY (and optionally AI_BASE_URL / AI_MODEL), or keep ENABLE_AI_MODERATOR false to use mock responses.",
  );
}

/** Free models sometimes wrap JSON in code fences or prose, so pull the object out defensively. */
function parseJson<T>(raw: string): T {
  const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("The model replied with text instead of JSON. Try again, or set AI_MODEL to a model that supports structured output.");
  }
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    throw new Error("The model returned malformed JSON. Try again, or switch AI_MODEL.");
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter((item) => item.trim() !== "");
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeRisk(value: unknown): StudentProgressAnalysis["risk"] {
  const risk = asString(value).toLowerCase();
  if (risk === "high" || risk === "medium" || risk === "low") return risk;
  return "medium";
}

async function chatJson<T>(system: string, user: string): Promise<T> {
  const endpoint = liveEndpoint();
  if (!endpoint) throw missingKeyError();

  let response: Response;
  try {
    response = await fetch(endpoint.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${endpoint.apiKey}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      body: JSON.stringify({
        model: endpoint.model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw new Error(`The AI provider did not answer within ${REQUEST_TIMEOUT_MS / 1000} seconds. Try again.`);
    }
    throw new Error("Could not reach the AI provider. Check AI_BASE_URL and your connection.");
  }

  if (response.status === 429) {
    throw new Error("The AI provider rate-limited the request (429). Wait a moment and try again.");
  }
  if (!response.ok) {
    let detail = "";
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      detail = asString(body?.error?.message);
    } catch {
      detail = "";
    }
    throw new Error(detail || `The AI provider returned HTTP ${response.status}.`);
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const content = asString(data.choices?.[0]?.message?.content);
  if (!content) throw new Error("The AI provider returned an empty response. Try again.");
  return parseJson<T>(content);
}

/** Summarizes a meeting transcript into completed work, support needs, and suggested goals. */
export async function generateMeetingSummary(transcript: string): Promise<MeetingSummary> {
  if (!FEATURES.ENABLE_AI_MODERATOR) return mockMeetingSummary(transcript);
  const result = await chatJson<{ summary?: unknown; completed?: unknown; needsSupport?: unknown; suggestedGoals?: unknown }>(
    'You are a study-group moderator for high school and college students. Reply with JSON only: {"summary": string, "completed": string[], "needsSupport": string[], "suggestedGoals": string[]}. Summarize what the group covered, what was finished, where someone got stuck, and 1-3 concrete goals for next week.',
    transcript,
  );
  const summary = asString(result.summary);
  if (!summary) throw new Error("The model returned no summary text. Try again.");
  return {
    summary,
    completed: asStringArray(result.completed),
    needsSupport: asStringArray(result.needsSupport),
    suggestedGoals: asStringArray(result.suggestedGoals),
  };
}

/** Proposes next week's goals from a summary of the previous goals. */
export async function generateGoals(context: string): Promise<GeneratedGoal[]> {
  if (!FEATURES.ENABLE_AI_MODERATOR) return mockGoals();
  const result = await chatJson<{ goals?: unknown }>(
    'You are a study-group moderator. Reply with JSON only: {"goals": [{"title": string, "description": string}]} with 1-3 concrete goals for next week.',
    context,
  );
  if (!Array.isArray(result.goals)) return [];
  return result.goals
    .map((goal) => ({
      title: asString((goal as { title?: unknown }).title),
      description: asString((goal as { description?: unknown }).description),
    }))
    .filter((goal) => goal.title !== "")
    .slice(0, 3);
}

/** Flags students who may need a check-in. */
export async function analyzeStudentProgress(assignments: GoalAssignment[]): Promise<StudentProgressAnalysis> {
  if (!FEATURES.ENABLE_AI_MODERATOR) return mockStudentProgress(assignments);
  const result = await chatJson<{ risk?: unknown; notes?: unknown }>(
    'Reply with JSON only: {"risk": "low" | "medium" | "high", "notes": string} for these goal assignments. "high" means the student is far behind and likely needs a check-in.',
    JSON.stringify(assignments),
  );
  return { risk: normalizeRisk(result.risk), notes: asString(result.notes) };
}

/**
 * One request for a whole point's members, so a free-tier budget of ~50 requests a day
 * goes a long way. Names come from our own data, never from the model.
 */
export async function analyzePointStudents(students: StudentInput[]): Promise<StudentRisk[]> {
  if (!FEATURES.ENABLE_AI_MODERATOR) return mockPointStudents(students);
  if (students.length === 0) return [];

  const result = await chatJson<{ risks?: unknown }>(
    'You are a study-group moderator. Reply with JSON only: {"risks": [{"userId": string, "risk": "low" | "medium" | "high", "notes": string}]}. Judge each student from their goal progress alone: "high" means far behind and likely needs a check-in, "medium" means drifting, "low" means on track. Keep each note under 20 words. Return one entry per userId given.',
    JSON.stringify(students.map(({ userId, name, assignments }) => ({ userId, name, assignments }))),
  );

  const byId = new Map<string, StudentProgressAnalysis>();
  if (Array.isArray(result.risks)) {
    for (const item of result.risks) {
      const entry = item as { userId?: unknown; risk?: unknown; notes?: unknown };
      const userId = asString(entry.userId);
      if (!userId) continue;
      byId.set(userId, { risk: normalizeRisk(entry.risk), notes: asString(entry.notes) });
    }
  }

  // Any student the model skipped falls back to the mock rather than disappearing.
  return students.map((student) => {
    const fromModel = byId.get(student.userId);
    const fallback = mockPointStudents([student])[0];
    return { ...fallback, userId: student.userId, name: student.name, ...(fromModel ?? {}) };
  });
}

/** Short encouraging message for a student. */
export async function generateMotivationMessage(name: string, context: string): Promise<string> {
  if (!FEATURES.ENABLE_AI_MODERATOR) return mockMotivation(name);
  const result = await chatJson<{ message?: unknown }>(
    'You encourage high school and college students in a study group. Reply with JSON only: {"message": string} with one or two warm, specific sentences. Never mention grades or failure.',
    `Student: ${name}. Context: ${context}`,
  );
  const message = asString(result.message);
  if (!message) throw new Error("The model returned no message. Try again.");
  return message;
}
