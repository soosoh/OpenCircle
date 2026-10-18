import { CHORD_CATALOG } from "@/config/chords";
import type { Goal, HelpRequest, Message, Point, PrivateMessage, User } from "@/types";
import type { RowWithId, TableName } from "./store";

export type SeedData = Record<TableName, RowWithId[]>;

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

const daysFromNow = (days: number, now: Date) => new Date(now.getTime() + days * DAY).toISOString();
const minutesAgo = (minutes: number, now: Date) => new Date(now.getTime() - minutes * 60_000).toISOString();

/**
 * Demo data for the in-memory store. Users sign in from /login by picking one of these
 * accounts. Editing this file is the simplest way to add demo people, points, or goals.
 */
export function buildSeed(now: Date = new Date()): SeedData {
  const users: User[] = [
    {
      id: "maya", name: "Maya Chen", age: 24, educationLevel: "College", gradeLevel: "Graduate student",
      school: "State University", bio: "Biology TA. Happy to review genetics problems.", avatarColor: "#22a58a",
      subjects: ["biology", "chemistry", "sat-prep"], experienceLevel: "Expert", timezone: "America/New_York",
      availability: [{ weekday: 0, start: "17:00", end: "21:00" }, { weekday: 2, start: "18:00", end: "21:00" }],
      reputation: 96, groupSuccessRate: 0.92, isCreator: true,
    },
    {
      id: "dev", name: "Dev Patel", age: 22, educationLevel: "College", gradeLevel: "Senior",
      school: "State University", bio: "Builds things, teaches Python on weekends.", avatarColor: "#4f7cf0",
      subjects: ["computer-science", "physics", "mathematics"], experienceLevel: "Advanced", timezone: "America/Chicago",
      availability: [{ weekday: 2, start: "19:00", end: "22:00" }, { weekday: 6, start: "09:00", end: "13:00" }],
      reputation: 94, groupSuccessRate: 0.9, isCreator: true,
    },
    {
      id: "bob", name: "Bob Martinez", age: 19, educationLevel: "College", gradeLevel: "Sophomore",
      school: "City College", avatarColor: "#f08a4b", subjects: ["biology", "chemistry"],
      experienceLevel: "Intermediate", timezone: "America/New_York",
      availability: [{ weekday: 0, start: "18:00", end: "22:00" }], reputation: 70, groupSuccessRate: 0.75, isCreator: false,
    },
    {
      id: "sarah", name: "Sarah Kim", age: 18, educationLevel: "High School", gradeLevel: "Grade 12",
      school: "Lincoln High", avatarColor: "#e2578a", subjects: ["biology", "sat-prep"],
      experienceLevel: "Intermediate", timezone: "America/New_York",
      availability: [{ weekday: 4, start: "16:00", end: "19:00" }], reputation: 65, groupSuccessRate: 0.8, isCreator: false,
    },
    {
      id: "john", name: "John Okafor", age: 17, educationLevel: "High School", gradeLevel: "Grade 11",
      school: "Lincoln High", avatarColor: "#8b5cf6", subjects: ["biology", "mathematics"],
      experienceLevel: "Beginner", timezone: "America/New_York",
      availability: [{ weekday: 0, start: "17:00", end: "20:00" }], reputation: 50, groupSuccessRate: 0.5, isCreator: false,
    },
    {
      id: "priya", name: "Priya Nair", age: 16, educationLevel: "High School", gradeLevel: "Grade 10",
      school: "Westfield High", avatarColor: "#0ea5b7", subjects: ["computer-science", "robotics"],
      experienceLevel: "Beginner", timezone: "America/Los_Angeles",
      availability: [{ weekday: 2, start: "17:00", end: "20:00" }], reputation: 40, groupSuccessRate: 0.6, isCreator: false,
    },
    {
      id: "alex", name: "Alex Rivera", age: 20, educationLevel: "College", gradeLevel: "Junior",
      school: "City College", avatarColor: "#84a31a", subjects: ["physics", "engineering"],
      experienceLevel: "Intermediate", timezone: "America/Denver",
      availability: [{ weekday: 6, start: "09:00", end: "12:00" }], reputation: 68, groupSuccessRate: 0.7, isCreator: false,
    },
  ];

  const chords = CHORD_CATALOG.map((chord) => ({
    ...chord,
    memberIds: users.filter((u) => u.subjects.includes(chord.id)).map((u) => u.id),
  }));

  const points: Point[] = ([
    {
      id: "ap-bio-genetics", chordId: "biology", title: "AP Biology Genetics Point",
      description: "Weekly session on Mendelian genetics, pedigrees, and practice problems.",
      audience: "all", moderatorId: "maya", memberIds: ["bob", "sarah", "john"],
      schedule: { weekday: 0, time: "19:00", timezone: "America/New_York" }, status: "Active",
      meeting: { provider: "demo", meetingId: "bio-genetics-room", meetingUrl: "", meetingPassword: "study" },
      createdAt: daysFromNow(-30, now),
    },
    {
      id: "chem-review", chordId: "chemistry", title: "Chemistry Review Point",
      description: "Stoichiometry and redox practice. Bring your lab notes.", audience: "all",
      moderatorId: "maya", memberIds: ["bob"], schedule: { weekday: 2, time: "18:00", timezone: "America/New_York" },
      status: "Active", meeting: { provider: "demo", meetingId: "chem-review-room", meetingUrl: "", meetingPassword: "study" },
      createdAt: daysFromNow(-20, now),
    },
    {
      id: "python-study", chordId: "computer-science", title: "Python Study Group",
      description: "Beginner-friendly Python. We build one small project each week.", audience: "all",
      moderatorId: "dev", memberIds: ["priya"], schedule: { weekday: 2, time: "20:00", timezone: "America/Chicago" },
      status: "Recruiting", meeting: { provider: "demo", meetingId: "python-room", meetingUrl: "", meetingPassword: "code" },
      createdAt: daysFromNow(-10, now),
    },
    {
      id: "sat-math", chordId: "sat-prep", title: "SAT Math Drills",
      description: "Timed algebra and data-analysis sets with a debrief.", audience: "high-school",
      moderatorId: "maya", memberIds: ["sarah"], schedule: { weekday: 4, time: "17:00", timezone: "America/New_York" },
      status: "Active", meeting: { provider: "demo", meetingId: "sat-math-room", meetingUrl: "", meetingPassword: "score" },
      createdAt: daysFromNow(-15, now),
    },
    {
      id: "physics-circle", chordId: "physics", title: "Physics Problem Circle",
      description: "Kinematics and energy problems, worked out together.", audience: "college",
      moderatorId: "dev", memberIds: ["alex"], schedule: { weekday: 6, time: "10:00", timezone: "America/Chicago" },
      status: "Paused", meeting: { provider: "demo", meetingId: "physics-room", meetingUrl: "", meetingPassword: "force" },
      createdAt: daysFromNow(-40, now),
    },
  ] satisfies Point[]).map((point) => ({
    ...point,
    meeting: { ...point.meeting, meetingUrl: `/points/${point.id}/meeting` },
  }));

  const goals: Goal[] = [
    {
      id: "goal-ch5", pointId: "ap-bio-genetics", title: "Finish Biology Chapter 5",
      description: "Read Chapter 5 and answer the end-of-chapter questions.", deadline: daysFromNow(3, now),
      status: "Needs assistance", resources: ["Chapter 5 PDF (shared in chat)"],
      assignments: [
        { userId: "bob", progress: 70, status: "On track" },
        { userId: "sarah", progress: 100, status: "Completed" },
        { userId: "john", progress: 20, status: "Needs assistance" },
      ],
      createdAt: daysFromNow(-7, now),
    },
    {
      id: "goal-practice", pointId: "ap-bio-genetics", title: "Complete practice problems",
      description: "Work through the Punnett square and pedigree sets.", deadline: daysFromNow(5, now),
      status: "On track", resources: ["Practice set 3 (handout)"],
      assignments: [
        { userId: "bob", progress: 40, status: "On track" },
        { userId: "sarah", progress: 60, status: "On track" },
        { userId: "john", progress: 0, status: "Needs assistance" },
      ],
      createdAt: daysFromNow(-2, now),
    },
    {
      id: "goal-redox", pointId: "chem-review", title: "Balance 20 redox equations",
      description: "Practice acidic and basic half-reactions.", deadline: daysFromNow(4, now), status: "On track",
      resources: [], assignments: [{ userId: "bob", progress: 50, status: "On track" }], createdAt: daysFromNow(-3, now),
    },
    {
      id: "goal-csv", pointId: "python-study", title: "Parse a CSV file",
      description: "Write a function that reads a CSV and prints totals.", deadline: daysFromNow(6, now), status: "On track",
      resources: [], assignments: [{ userId: "priya", progress: 10, status: "On track" }], createdAt: daysFromNow(-1, now),
    },
    {
      id: "goal-algebra", pointId: "sat-math", title: "Finish 30 algebra questions",
      description: "Timed set, then review every miss.", deadline: daysFromNow(2, now), status: "Needs assistance",
      resources: [], assignments: [{ userId: "sarah", progress: 30, status: "Needs assistance" }], createdAt: daysFromNow(-4, now),
    },
    {
      id: "goal-projectile", pointId: "physics-circle", title: "Solve projectile motion set",
      description: "Five problems on range and max height.", deadline: daysFromNow(1, now), status: "Completed",
      resources: [], assignments: [{ userId: "alex", progress: 100, status: "Completed" }], createdAt: daysFromNow(-6, now),
    },
  ];

  const messages: Message[] = [
    { id: "msg-1", pointId: "ap-bio-genetics", senderId: "maya", content: "Welcome to Genetics! Post questions here anytime.", kind: "message", timestamp: minutesAgo(600, now) },
    { id: "msg-2", pointId: "ap-bio-genetics", senderId: "bob", content: "Does anyone have the Punnett square worksheet?", kind: "question", timestamp: minutesAgo(240, now) },
    { id: "msg-3", pointId: "ap-bio-genetics", senderId: "sarah", content: "Here is my summary of Mendelian ratios.", kind: "resource", timestamp: minutesAgo(90, now) },
  ];

  const helpRequests: HelpRequest[] = [
    { id: "help-1", pointId: "ap-bio-genetics", userId: "john", reason: "Need help understanding Hardy-Weinberg equations.", status: "open", createdAt: minutesAgo(45, now) },
  ];

  const privateMessages: PrivateMessage[] = [
    { id: "pm-1", pointId: "ap-bio-genetics", senderId: "maya", recipientId: "john", content: "Hey John, let's go through Hardy-Weinberg after the session. Does Tuesday work?", timestamp: minutesAgo(40, now) },
  ];

  return {
    users, chords, points, goals, messages, help_requests: helpRequests, private_messages: privateMessages,
  } as unknown as SeedData;
}
