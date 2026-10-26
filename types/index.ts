/** Shared domain types. Keep every entity shape here. */

/** "all" means no restriction. Used for chords/points and for the age filter. */
export type Audience = "all" | "high-school" | "college";
export type EducationLevel = "High School" | "College";
export type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";
export type GoalStatus = "On track" | "Needs assistance" | "Completed";
export type PointStatus = "Recruiting" | "Active" | "Paused";
export type MeetingProvider = "demo" | "zoom";
export type MessageKind = "message" | "question" | "resource";
export type HelpRequestStatus = "open" | "resolved";

/** weekday: 0 = Sunday ... 6 = Saturday. time: "HH:MM" 24h in `timezone`. */
export interface AvailabilitySlot {
  weekday: number;
  start: string;
  end: string;
}

/** Why a reputation award happened. The rules live in lib/domain/reputation.ts. */
export type ReputationKind = "goal-completed" | "goal-set" | "request-resolved" | "resource-shared";

/** One line of a member's reputation history, stored on the user document. */
export interface ReputationEvent {
  /** Dedupe key, e.g. "goal-completed:goal-ab12": the same key is never awarded twice. */
  key: string;
  kind: ReputationKind;
  /** Points added to reputation (0 when the member was already at 100). */
  delta: number;
  /** ISO timestamp */
  at: string;
  /** The point the action happened in, for linking. */
  pointId?: string;
}

export interface User {
  id: string;
  name: string;
  age: number;
  educationLevel: EducationLevel;
  gradeLevel: string;
  school?: string;
  bio?: string;
  avatarColor: string;
  subjects: string[];
  experienceLevel: ExperienceLevel;
  timezone: string;
  availability: AvailabilitySlot[];
  /** 0-100. Starts at 50, grows through reputation events, used by moderator selection. */
  reputation: number;
  /** 0-1. Share of assigned goals completed in the points this member moderates. */
  groupSuccessRate: number;
  /**
   * Newest-last history of what earned reputation (capped, see lib/domain/reputation.ts).
   * Stored inside the user document, so no table or migration is needed on any backend.
   */
  reputationLog?: ReputationEvent[];
  /** Website creators are the initial moderators. */
  isCreator: boolean;
}

export interface Chord {
  id: string;
  name: string;
  description: string;
  color: string;
  audience: Audience;
  memberIds: string[];
}

export interface MeetingInfo {
  provider: MeetingProvider;
  meetingId: string;
  meetingUrl: string;
  meetingPassword: string;
}

/** Recurring-ready schedule. Points are one-off weekly meetings for now. */
export interface WeeklySchedule {
  weekday: number;
  time: string;
  timezone: string;
}

export interface Point {
  id: string;
  chordId: string;
  title: string;
  description: string;
  audience: Audience;
  moderatorId: string;
  memberIds: string[];
  schedule: WeeklySchedule;
  status: PointStatus;
  meeting: MeetingInfo;
  createdAt: string;
}

export interface GoalAssignment {
  userId: string;
  /** 0-100 */
  progress: number;
  status: GoalStatus;
}

export interface Goal {
  id: string;
  pointId: string;
  title: string;
  description: string;
  /** ISO timestamp */
  deadline: string;
  status: GoalStatus;
  resources: string[];
  assignments: GoalAssignment[];
  createdAt: string;
}

export interface Message {
  id: string;
  pointId: string;
  senderId: string;
  content: string;
  kind: MessageKind;
  timestamp: string;
}

export interface HelpRequest {
  id: string;
  pointId: string;
  userId: string;
  reason: string;
  status: HelpRequestStatus;
  createdAt: string;
}

export interface PrivateMessage {
  id: string;
  pointId: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
}

export interface ScheduleItem {
  id: string;
  kind: "meeting" | "deadline";
  title: string;
  /** ISO timestamp */
  at: string;
  chordId?: string;
  pointId: string;
  href: string;
}

export interface ProfileInput {
  name: string;
  age: number;
  educationLevel: EducationLevel;
  gradeLevel: string;
  school?: string;
  bio?: string;
  subjects: string[];
  experienceLevel: ExperienceLevel;
  timezone: string;
  availability: AvailabilitySlot[];
}
