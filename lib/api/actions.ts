"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FEATURES } from "@/config/features";
import {
  analyzePointStudents as analyzePointStudentsAi,
  generateGoals,
  generateMeetingSummary,
  generateMotivationMessage,
  type GeneratedGoal,
  type MeetingSummary,
  type StudentInput,
  type StudentRisk,
} from "@/lib/ai/openai";
import * as repo from "@/lib/database/repository";
import { canJoinAudience, parseAudience } from "@/lib/domain/audience";
import { selectModerator } from "@/lib/domain/moderation";
import { deriveGoalStatus } from "@/lib/domain/progress";
import { nextWeeklyOccurrence } from "@/lib/domain/time";
import { createZoomMeeting, endMeeting, getMeetingTranscript } from "@/lib/zoom/zoom";
import { parseProfileForm } from "./profile";
import {
  clearSession,
  DEMO_PASSWORD,
  isSupabaseAuthEnabled,
  requireUser,
  setSessionUser,
  supabaseCreateUser,
  supabaseSignIn,
  type AuthState,
} from "./session";
import type { Chord, Goal, GoalAssignment, GoalStatus, Point, User } from "@/types";

/**
 * Server actions: every mutation in the app goes through this file.
 * Each action re-checks the session and the permission it needs (membership, moderator, audience).
 * Invalid input throws an Error with a user-readable message.
 */

const AVATAR_COLORS = ["#22a58a", "#f08a4b", "#4f7cf0", "#e2578a", "#8b5cf6", "#0ea5b7", "#84a31a"];
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
const text = (form: FormData, key: string, max: number) => String(form.get(key) ?? "").trim().slice(0, max);

async function requirePoint(pointId: string): Promise<Point> {
  const point = await repo.getPoint(pointId);
  if (!point) throw new Error("This point no longer exists.");
  return point;
}

const isModerator = (point: Point, userId: string) => point.moderatorId === userId;
const isMember = (point: Point, userId: string) => isModerator(point, userId) || point.memberIds.includes(userId);

function revalidatePoint(point: Point) {
  revalidatePath(`/points/${point.id}`);
  revalidatePath(`/chords/${point.chordId}`);
  revalidatePath("/dashboard");
  revalidatePath("/moderator");
}

/** Adds a user to a chord (and to their interests). Enforces the audience rule. */
async function joinChordFor(user: User, chord: Chord): Promise<void> {
  const check = canJoinAudience(user, chord.audience);
  if (!check.ok) throw new Error(check.reason);
  if (!chord.memberIds.includes(user.id)) {
    await repo.updateChord(chord.id, { memberIds: [...chord.memberIds, user.id] });
  }
  if (!user.subjects.includes(chord.id)) {
    await repo.updateUser(user.id, { subjects: [...user.subjects, chord.id] });
  }
}

// ---------- Accounts ----------

/** Demo-account picker sign-in (memory backend only; cards carry a shared password). */
export async function signIn(formData: FormData) {
  if (isSupabaseAuthEnabled()) return;
  if (String(formData.get("password") ?? "") !== DEMO_PASSWORD) {
    throw new Error(`The demo password is ${DEMO_PASSWORD}.`);
  }
  const user = await repo.getUser(String(formData.get("userId") ?? ""));
  if (!user) throw new Error("Unknown account.");
  await setSessionUser(user.id);
  redirect("/dashboard");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  let id = newId("user");
  let email = "";
  let password = "";
  try {
    const profile = parseProfileForm(formData);
    email = text(formData, "email", 120).toLowerCase();
    password = String(formData.get("password") ?? "");
    if (isSupabaseAuthEnabled()) {
      if (!email) throw new Error("Email is required.");
      if (password.length < 6) throw new Error("Password must be at least 6 characters.");
      id = await supabaseCreateUser(email, password);
    }
    const user: User = {
      id,
      ...profile,
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      reputation: 50,
      groupSuccessRate: 0,
      isCreator: false,
    };
    await repo.insertUser(user);
    if (isSupabaseAuthEnabled()) {
      const signedIn = await supabaseSignIn(email, password);
      if (!signedIn) {
        throw new Error("Account created, but automatic sign-in failed. Sign in from the top of this page.");
      }
    } else {
      await setSessionUser(user.id);
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create the account." };
  }
  redirect("/dashboard");
}

/** Email + password sign-in (Supabase Auth backend only). */
export async function signInWithPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, "email", 120).toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  if (!isSupabaseAuthEnabled()) {
    return { error: "Password sign-in needs DATA_BACKEND=supabase. Pick a demo account instead." };
  }
  const id = await supabaseSignIn(email, password);
  if (!id) return { error: "Wrong email or password." };
  redirect("/dashboard");
}

export async function signOut() {
  await clearSession();
  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  await repo.updateUser(user.id, parseProfileForm(formData));
  revalidatePath("/profile");
  revalidatePath("/dashboard");
}

// ---------- Chords and points ----------

export async function joinChord(chordId: string) {
  const user = await requireUser();
  const chord = await repo.getChord(chordId);
  if (!chord) throw new Error("Chord not found.");
  await joinChordFor(user, chord);
  revalidatePath(`/chords/${chordId}`);
  revalidatePath("/dashboard");
}

export async function joinPoint(pointId: string) {
  const user = await requireUser();
  const point = await requirePoint(pointId);
  const check = canJoinAudience(user, point.audience);
  if (!check.ok) throw new Error(check.reason);

  const chord = await repo.getChord(point.chordId);
  if (chord) await joinChordFor(user, chord);

  if (!point.memberIds.includes(user.id)) {
    await repo.updatePoint(point.id, { memberIds: [...point.memberIds, user.id] });
  }
  revalidatePoint(point);
}

export async function createPoint(chordId: string, formData: FormData) {
  const user = await requireUser();
  const chord = await repo.getChord(chordId);
  if (!chord) throw new Error("Chord not found.");

  const title = text(formData, "title", 80);
  if (!title) throw new Error("Give the point a title.");
  const description = text(formData, "description", 400);
  const weekday = Number(formData.get("weekday"));
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) throw new Error("Choose a meeting day.");
  const time = String(formData.get("time") ?? "");
  if (!TIME_PATTERN.test(time)) throw new Error("Choose a meeting time.");

  // Points inherit the chord's audience restriction so a chord cannot contain conflicting groups.
  const audience = chord.audience !== "all" ? chord.audience : parseAudience(String(formData.get("audience")));
  const users = await repo.listUsers();
  const moderator = selectModerator(users, chordId) ?? users.find((u) => u.isCreator);
  if (!moderator) throw new Error("No eligible moderator is available.");

  const schedule = { weekday, time, timezone: user.timezone };
  const pointId = newId("point");
  const zoom = await createZoomMeeting({ topic: title, schedule });

  const point: Point = {
    id: pointId,
    chordId,
    title,
    description,
    audience,
    moderatorId: moderator.id,
    memberIds: [user.id],
    schedule,
    status: "Recruiting",
    meeting: {
      provider: zoom.provider,
      meetingId: zoom.meetingId,
      meetingUrl: zoom.provider === "zoom" ? zoom.meetingUrl : `/points/${pointId}/meeting`,
      meetingPassword: zoom.meetingPassword,
    },
    createdAt: new Date().toISOString(),
  };
  await repo.insertPoint(point);
  await joinChordFor(user, chord);
  revalidatePath(`/chords/${chordId}`);
  revalidatePath("/dashboard");
  redirect(`/points/${pointId}`);
}

export async function joinPointForm(formData: FormData) {
  await joinPoint(String(formData.get("pointId") ?? ""));
}

// ---------- Point chat, SOS, and private messages ----------

export async function sendMessage(pointId: string, formData: FormData) {
  const user = await requireUser();
  const point = await requirePoint(pointId);
  if (!isMember(point, user.id)) throw new Error("Join this point to chat.");
  const content = text(formData, "content", 1000);
  if (!content) return;
  const kind = String(formData.get("kind") ?? "message");
  await repo.insertMessage({
    id: newId("msg"),
    pointId,
    senderId: user.id,
    content,
    kind: kind === "question" || kind === "resource" ? kind : "message",
    timestamp: new Date().toISOString(),
  });
  revalidatePath(`/points/${pointId}`);
}

export async function raiseSos(pointId: string, formData: FormData) {
  const user = await requireUser();
  const point = await requirePoint(pointId);
  if (!isMember(point, user.id)) throw new Error("Join this point to ask for support.");
  await repo.insertHelpRequest({
    id: newId("help"),
    pointId,
    userId: user.id,
    reason: text(formData, "reason", 200) || "Need support",
    status: "open",
    createdAt: new Date().toISOString(),
  });
  revalidatePoint(point);
}

export async function resolveHelpRequest(requestId: string) {
  const user = await requireUser();
  const request = await repo.getHelpRequest(requestId);
  if (!request) throw new Error("Help request not found.");
  const point = await requirePoint(request.pointId);
  if (!isModerator(point, user.id)) throw new Error("Only the point moderator can resolve requests.");
  await repo.updateHelpRequest(requestId, { status: "resolved" });
  revalidatePoint(point);
}

export async function sendPrivateMessage(pointId: string, formData: FormData) {
  const user = await requireUser();
  const point = await requirePoint(pointId);
  const recipientId = String(formData.get("recipientId") ?? "");
  const content = text(formData, "content", 1000);
  if (!content) return;

  // Moderators message their members. Members may only reply to the moderator.
  const moderatorSends = isModerator(point, user.id) && point.memberIds.includes(recipientId);
  const memberReplies = point.memberIds.includes(user.id) && recipientId === point.moderatorId;
  if (!moderatorSends && !memberReplies) throw new Error("Private messages go between the moderator and members of this point.");

  await repo.insertPrivateMessage({
    id: newId("pm"),
    pointId,
    senderId: user.id,
    recipientId,
    content,
    timestamp: new Date().toISOString(),
  });
  revalidatePath("/moderator");
  revalidatePath(`/points/${pointId}`);
  revalidatePath("/dashboard");
}

// ---------- Goals ----------

export async function createGoal(pointId: string, formData: FormData) {
  const user = await requireUser();
  const point = await requirePoint(pointId);
  if (!isModerator(point, user.id)) throw new Error("Only the point moderator can record goals.");

  const title = text(formData, "title", 120);
  if (!title) throw new Error("Goal title is required.");
  const deadlineInput = String(formData.get("deadline") ?? "");
  const deadline = new Date(`${deadlineInput}T23:59:59Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadlineInput) || Number.isNaN(deadline.getTime())) throw new Error("Choose a deadline.");

  const requested = formData.getAll("assignees").map(String).filter((id) => point.memberIds.includes(id));
  const assignees = requested.length > 0 ? requested : point.memberIds;
  const assignments: GoalAssignment[] = assignees.map((userId) => ({ userId, progress: 0, status: "On track" }));

  const goal: Goal = {
    id: newId("goal"),
    pointId,
    title,
    description: text(formData, "description", 500),
    deadline: deadline.toISOString(),
    status: deriveGoalStatus(assignments),
    resources: String(formData.get("resources") ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 10),
    assignments,
    createdAt: new Date().toISOString(),
  };
  await repo.insertGoal(goal);
  revalidatePoint(point);
}

export async function updateGoalProgress(goalId: string, formData: FormData) {
  const user = await requireUser();
  const goal = await repo.getGoal(goalId);
  if (!goal) throw new Error("Goal not found.");
  const point = await requirePoint(goal.pointId);

  const targetId = String(formData.get("userId") || user.id);
  if (targetId !== user.id && !isModerator(point, user.id)) {
    throw new Error("You can only update your own progress.");
  }
  if (!goal.assignments.some((a) => a.userId === targetId)) throw new Error("That member is not assigned to this goal.");

  const progress = Math.min(100, Math.max(0, Math.round(Number(formData.get("progress")))));
  if (Number.isNaN(progress)) throw new Error("Progress must be a number from 0 to 100.");
  const requested = String(formData.get("status") ?? "On track");
  const status: GoalStatus = progress === 100 ? "Completed" : requested === "Needs assistance" ? "Needs assistance" : "On track";

  const assignments = goal.assignments.map((a) => (a.userId === targetId ? { ...a, progress, status } : a));
  await repo.updateGoal(goalId, { assignments, status: deriveGoalStatus(assignments) });
  revalidatePoint(point);
}

interface TranscriptState {
  error?: string;
  ended?: boolean;
  transcript?: string;
}

/**
 * Ends a point's meeting and returns its transcript in one round trip. Moderator only.
 * Demo-provider points never call Zoom. getMeetingTranscript returns "" when no transcript
 * exists yet, which the UI shows as a friendly message.
 */
export async function endPointMeeting(
  pointId: string,
  _prev: TranscriptState,
  _formData: FormData,
): Promise<TranscriptState> {
  const user = await requireUser();
  const point = await requirePoint(pointId);
  if (!isModerator(point, user.id)) return { error: "Only the point moderator can end the meeting." };
  if (point.meeting.provider === "zoom") {
    try {
      await endMeeting(point.meeting.meetingId);
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Zoom could not end the meeting." };
    }
  }
  let transcript = "";
  try {
    transcript = await getMeetingTranscript(point.meeting.meetingId);
  } catch (error) {
    console.error("Transcript fetch failed after ending the meeting.", error);
  }
  revalidatePath(`/points/${pointId}/meeting`);
  revalidatePath(`/points/${pointId}`);
  return { ended: true, transcript };
}

/** Moderator-only fetch of the cloud-recording transcript without ending the meeting. */
export async function fetchPointMeetingTranscript(
  pointId: string,
  _prev: TranscriptState,
  _formData: FormData,
): Promise<TranscriptState> {
  const user = await requireUser();
  const point = await requirePoint(pointId);
  if (!isModerator(point, user.id)) return { error: "Only the point moderator can fetch the transcript." };
  try {
    const transcript = await getMeetingTranscript(point.meeting.meetingId);
    return { transcript };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The transcript could not be fetched." };
  }
}

// ---------- AI moderator assistant ----------
// With ENABLE_AI_MODERATOR false these return mock data (see lib/ai/openai.ts), so every
// surface below is testable with no key and no network. The AI only ever proposes:
// recording a goal still goes through createGoal, which re-checks the moderator.

export interface AssistantState {
  error?: string;
  summary?: MeetingSummary;
  goals?: GeneratedGoal[];
  source?: "pasted" | "recording";
  live?: boolean;
}

export async function runMeetingAssistant(pointId: string, _prev: AssistantState, formData: FormData): Promise<AssistantState> {
  const user = await requireUser();
  const point = await requirePoint(pointId);
  if (!isModerator(point, user.id)) return { error: "Only the point moderator can use the assistant." };

  let transcript = text(formData, "transcript", 20_000);
  let source: "pasted" | "recording" = "pasted";
  if (!transcript && formData.get("useRecording") === "on") {
    transcript = await getMeetingTranscript(point.meeting.meetingId);
    source = "recording";
    if (!transcript) return { error: "This meeting has no transcript yet. Paste notes instead." };
  }
  if (!transcript) return { error: "Paste meeting notes, or tick \u201cuse the meeting recording\u201d." };

  try {
    const summary = await generateMeetingSummary(transcript);
    const goals = await generateGoals(JSON.stringify({ summary }));
    return { summary, goals, source, live: FEATURES.ENABLE_AI_MODERATOR };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The AI request failed." };
  }
}

export interface RiskState {
  error?: string;
  risks?: StudentRisk[];
  live?: boolean;
}

/** One model call covers every member of a point, so a free-tier request budget goes a long way. */
export async function analyzePointStudents(pointId: string, prev: RiskState, formData: FormData): Promise<RiskState> {
  const user = await requireUser();
  const point = await requirePoint(pointId);
  if (!isModerator(point, user.id)) return { error: "Only the point moderator can run this check." };

  const [goals, users] = await Promise.all([repo.listGoals(), repo.listUsers()]);
  const userById = new Map(users.map((entry) => [entry.id, entry]));
  const pointGoals = goals.filter((goal) => goal.pointId === pointId);

  const students: StudentInput[] = [...new Set([...point.memberIds, point.moderatorId])]
    .map((id) => {
      const member = userById.get(id);
      if (!member) return null;
      const assignments = pointGoals
        .map((goal) => goal.assignments.find((assignment) => assignment.userId === id))
        .filter((assignment): assignment is GoalAssignment => assignment !== undefined);
      return { userId: id, name: member.name, assignments };
    })
    .filter((student): student is StudentInput => student !== null);

  if (students.length === 0) return { error: "This point has no members to check yet." };

  try {
    return { risks: await analyzePointStudentsAi(students), live: FEATURES.ENABLE_AI_MODERATOR };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The student check failed." };
  }
}

export interface MotivationState {
  error?: string;
  message?: string;
  live?: boolean;
}

/** On demand only, never on page load: the free model tier is roughly 50 requests a day. */
export async function getMotivation(prev: MotivationState, formData: FormData): Promise<MotivationState> {
  const user = await requireUser();
  const [points, goals] = await Promise.all([repo.listPoints(), repo.listGoals()]);
  const myPoints = points.filter(
    (point) => point.memberIds.includes(user.id) || point.moderatorId === user.id,
  );
  const myGoals = goals.filter((goal) => goal.assignments.some((assignment) => assignment.userId === user.id));

  const context = [
    `Points: ${myPoints.map((point) => point.title).join(", ") || "none yet"}.`,
    `Goals: ${myGoals.map((goal) => `${goal.title} (${goal.status})`).join(", ") || "none yet"}.`,
  ].join(" ");

  try {
    return { message: await generateMotivationMessage(user.name, context), live: FEATURES.ENABLE_AI_MODERATOR };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not reach the AI provider." };
  }
}
