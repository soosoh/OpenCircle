import { CHORD_CATALOG } from "@/config/chords";
import { weekStart } from "@/lib/domain/activity";
import { canJoinAudience } from "@/lib/domain/audience";
import type { Chord, Goal, HelpRequest, Message, Point, PrivateMessage, User } from "@/types";
import type { RowWithId, TableName } from "./store";

export type SeedData = Record<TableName, RowWithId[]>;

/**
 * Bump whenever buildSeed() changes shape or content. The memory store saves its data to
 * a local file and only reuses that file when the versions match, so an old save never
 * hides new demo data.
 */
export const SEED_VERSION = 2;

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

const daysFromNow = (days: number, now: Date) => new Date(now.getTime() + days * DAY).toISOString();
const minutesAgo = (minutes: number, now: Date) => new Date(now.getTime() - minutes * 60_000).toISOString();

/**
 * Demo data for the in-memory store. Users sign in from /login by picking one of these
 * accounts. Editing this file is the simplest way to add demo people, points, or goals.
 */
export function buildSeed(now: Date = new Date()): SeedData {
  return reconcileMemberships(buildRawSeed(now));
}

/**
 * The membership links the app maintains at runtime, restored for data that predates them:
 * everyone in a point belongs to its chord, and every chord member lists that chord as a subject.
 * Only ever adds links, so it is idempotent and safe to run on loaded saves too.
 */
export function reconcileMemberships(data: SeedData): SeedData {
  const chords = data.chords as unknown as Chord[];
  const users = data.users as unknown as User[];
  const chordById = new Map(chords.map((chord) => [chord.id, chord]));
  for (const point of data.points as unknown as Point[]) {
    const chord = chordById.get(point.chordId);
    if (!chord) continue;
    for (const id of point.memberIds) if (!chord.memberIds.includes(id)) chord.memberIds.push(id);
  }
  for (const chord of chords) {
    for (const user of users) {
      if (chord.memberIds.includes(user.id) && !user.subjects.includes(chord.id)) user.subjects.push(chord.id);
    }
  }
  return data;
}

function buildRawSeed(now: Date): SeedData {
  const users: User[] = [
    {
      id: "maya", name: "Maya Chen", age: 24, educationLevel: "College", gradeLevel: "Graduate student",
      school: "State University", bio: "Biology TA. Happy to review genetics problems.", avatarColor: "#2E7D5B",
      subjects: ["biology", "chemistry", "sat-prep"], experienceLevel: "Expert", timezone: "America/New_York",
      availability: [{ weekday: 0, start: "17:00", end: "21:00" }, { weekday: 2, start: "18:00", end: "21:00" }],
      reputation: 96, groupSuccessRate: 0.92, isCreator: true,
    },
    {
      id: "dev", name: "Dev Patel", age: 22, educationLevel: "College", gradeLevel: "Senior",
      school: "State University", bio: "Builds things, teaches Python on weekends.", avatarColor: "#B85C1E",
      subjects: ["computer-science", "physics", "mathematics"], experienceLevel: "Advanced", timezone: "America/Chicago",
      availability: [{ weekday: 2, start: "19:00", end: "22:00" }, { weekday: 6, start: "09:00", end: "13:00" }],
      reputation: 94, groupSuccessRate: 0.9, isCreator: true,
    },
    {
      id: "bob", name: "Bob Martinez", age: 19, educationLevel: "College", gradeLevel: "Sophomore",
      school: "City College", avatarColor: "#8C3A22", subjects: ["biology", "chemistry"],
      experienceLevel: "Intermediate", timezone: "America/New_York",
      availability: [{ weekday: 0, start: "18:00", end: "22:00" }], reputation: 70, groupSuccessRate: 0.75, isCreator: false,
    },
    {
      id: "sarah", name: "Sarah Kim", age: 18, educationLevel: "High School", gradeLevel: "Grade 12",
      school: "Lincoln High", avatarColor: "#A83A50", subjects: ["biology", "sat-prep"],
      experienceLevel: "Intermediate", timezone: "America/New_York",
      availability: [{ weekday: 4, start: "16:00", end: "19:00" }], reputation: 65, groupSuccessRate: 0.8, isCreator: false,
    },
    {
      id: "john", name: "John Okafor", age: 17, educationLevel: "High School", gradeLevel: "Grade 11",
      school: "Lincoln High", avatarColor: "#2D6A73", subjects: ["biology", "mathematics"],
      experienceLevel: "Beginner", timezone: "America/New_York",
      availability: [{ weekday: 0, start: "17:00", end: "20:00" }], reputation: 50, groupSuccessRate: 0.5, isCreator: false,
    },
    {
      id: "priya", name: "Priya Nair", age: 16, educationLevel: "High School", gradeLevel: "Grade 10",
      school: "Westfield High", avatarColor: "#5A4632", subjects: ["computer-science", "robotics"],
      experienceLevel: "Beginner", timezone: "America/Los_Angeles",
      availability: [{ weekday: 2, start: "17:00", end: "20:00" }], reputation: 40, groupSuccessRate: 0.6, isCreator: false,
    },
    {
      id: "alex", name: "Alex Rivera", age: 20, educationLevel: "College", gradeLevel: "Junior",
      school: "City College", avatarColor: "#4F6B2A", subjects: ["physics", "engineering"],
      experienceLevel: "Intermediate", timezone: "America/Denver",
      availability: [{ weekday: 6, start: "09:00", end: "12:00" }], reputation: 68, groupSuccessRate: 0.7, isCreator: false,
    },
  ];

  const chords = CHORD_CATALOG.map((chord) => ({
    ...chord,
    // A seeded membership must obey the same audience rule as joinChord(): never put a
    // college student inside a high-school chord, or vice versa.
    memberIds: users
      .filter((u) => u.subjects.includes(chord.id) && canJoinAudience(u, chord.audience).ok)
      .map((u) => u.id),
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
      moderatorId: "dev", memberIds: ["priya", "alex"], schedule: { weekday: 2, time: "20:00", timezone: "America/Chicago" },
      status: "Recruiting", meeting: { provider: "demo", meetingId: "python-room", meetingUrl: "", meetingPassword: "code" },
      createdAt: daysFromNow(-10, now),
    },
    {
      id: "sat-math", chordId: "sat-prep", title: "SAT Math Drills",
      description: "Timed algebra and data-analysis sets with a debrief.", audience: "high-school",
      // Sarah is the highest-scoring high-school member for this chord, and a college
      // moderator could not join a high-school point.
      moderatorId: "sarah", memberIds: ["sarah"], schedule: { weekday: 4, time: "17:00", timezone: "America/New_York" },
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
  ] satisfies Point[]).map((point): Point => ({
    ...point,
    // The moderator is a participant, so the stored membership is explicit: every
    // moderatorId also appears in memberIds.
    memberIds: [...new Set([...point.memberIds, point.moderatorId])],
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
      status: "Needs assistance", resources: ["Practice set 3 (handout)"],
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
      resources: [], assignments: [
        { userId: "priya", progress: 10, status: "On track" },
        { userId: "dev", progress: 35, status: "On track" },
        { userId: "alex", progress: 15, status: "On track" },
      ], createdAt: daysFromNow(-1, now),
    },
    {
      id: "goal-reading-list", pointId: "python-study", title: "Ship the reading-list script",
      description: "Settle on the data shape, then get one end-to-end run working.", deadline: daysFromNow(4, now),
      status: "On track", resources: ["Starter repo (shared in chat)"], assignments: [
        { userId: "dev", progress: 60, status: "On track" },
        { userId: "priya", progress: 20, status: "On track" },
      ], createdAt: daysFromNow(-5, now),
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
    { id: "msg-4", pointId: "python-study", senderId: "dev", content: "Tuesday is the CSV check-in. Bring whatever runs, even if it breaks.", kind: "message", timestamp: minutesAgo(320, now) },
    { id: "msg-5", pointId: "python-study", senderId: "priya", content: "My loop reads the header row as data. Is that normal?", kind: "question", timestamp: minutesAgo(120, now) },
  ];

  const helpRequests: HelpRequest[] = [
    { id: "help-1", pointId: "ap-bio-genetics", userId: "john", reason: "Need help understanding Hardy-Weinberg equations.", status: "open", createdAt: minutesAgo(45, now) },
    { id: "help-2", pointId: "python-study", userId: "priya", reason: "Stuck on the CSV parsing loop and would like to talk it through.", status: "open", createdAt: minutesAgo(70, now) },
  ];

  const privateMessages: PrivateMessage[] = [
    { id: "pm-1", pointId: "ap-bio-genetics", senderId: "maya", recipientId: "john", content: "Hey John, let's go through Hardy-Weinberg after the session. Does Tuesday work?", timestamp: minutesAgo(40, now) },
  ];

  // ---- Historical activity (feeds the dashboard streak, momentum and showing-up cards) ----
  // Deterministic and relative to `now`: each entry places a member in a point on
  // specific weeks back (1 = last week). Times are anchored on that week's Monday in
  // the member's own timezone, so a record never slides into a neighbouring week.
  // The live rows above cover the current week (week 0).
  const timezoneOf = new Map(users.map((u) => [u.id, u.timezone]));
  const atWeek = (userId: string, weeksBack: number, dayOfWeek: number, hour: number) => {
    const monday = weekStart(now, timezoneOf.get(userId) ?? "UTC");
    return new Date(monday.getTime() - weeksBack * 7 * DAY + dayOfWeek * DAY + hour * HOUR).toISOString();
  };
  const CHAT_LINES = [
    "Finished the practice set. Most of the answers matched the key.",
    "Can someone check my working on question 4?",
    "Sharing my notes from this week's session.",
    "That walkthrough finally made it click, thank you.",
    "I will bring my worksheet to the next meeting.",
    "Does anyone want to trade problem sets before we meet?",
  ];
  const history: { userId: string; pointId: string; weeks: number[] }[] = [
    // Dev: a six-week run now (with this week), one missed week, then a longer run before it.
    { userId: "dev", pointId: "python-study", weeks: [1, 2, 3, 4, 5] },
    { userId: "dev", pointId: "physics-circle", weeks: [7, 8, 9, 10, 11, 12, 13] },
    // Maya: steady, with two quiet weeks.
    { userId: "maya", pointId: "ap-bio-genetics", weeks: [1, 2, 4, 5, 6, 7, 9, 10, 11, 12, 13] },
    // Bob: on and off.
    { userId: "bob", pointId: "ap-bio-genetics", weeks: [2, 3, 5, 6, 9, 10] },
    // Sarah: a recent run, a long gap, an earlier burst.
    { userId: "sarah", pointId: "sat-math", weeks: [1, 2, 3, 9, 10] },
    // Priya: joined recently.
    { userId: "priya", pointId: "python-study", weeks: [1] },
  ];
  const historyMessages: Message[] = history.flatMap(({ userId, pointId, weeks }) =>
    weeks.flatMap((week) =>
      Array.from({ length: 1 + (week % 3) }, (_, i) => {
        const content = CHAT_LINES[(week + i + userId.length) % CHAT_LINES.length];
        return {
          id: `hist-msg-${userId}-${week}-${i}`,
          pointId,
          senderId: userId,
          content,
          kind: content.endsWith("?") ? "question" : "message",
          timestamp: atWeek(userId, week, (week * 2 + i * 2) % 5, 15 + i * 2),
        } satisfies Message;
      }),
    ),
  );
  const historyHelp: HelpRequest[] = [
    { id: "hist-help-bob-5", pointId: "ap-bio-genetics", userId: "bob", reason: "Stuck on dihybrid crosses.", status: "resolved", createdAt: atWeek("bob", 5, 2, 18) },
    { id: "hist-help-sarah-2", pointId: "sat-math", userId: "sarah", reason: "Word problems keep tripping me up.", status: "resolved", createdAt: atWeek("sarah", 2, 3, 16) },
    { id: "hist-help-priya-1", pointId: "python-study", userId: "priya", reason: "Could not get my environment running.", status: "resolved", createdAt: atWeek("priya", 1, 1, 17) },
  ];
  const historyPrivate: PrivateMessage[] = [
    { id: "hist-pm-maya-5", pointId: "ap-bio-genetics", senderId: "maya", recipientId: "bob", content: "Nice progress on the crosses. Ping me if the next set gets rough.", timestamp: atWeek("maya", 5, 1, 19) },
    { id: "hist-pm-bob-5", pointId: "ap-bio-genetics", senderId: "bob", recipientId: "maya", content: "Will do, thanks.", timestamp: atWeek("bob", 5, 1, 20) },
    { id: "hist-pm-dev-3", pointId: "python-study", senderId: "dev", recipientId: "priya", content: "Your loop is fine. Skip the header row before you start summing.", timestamp: atWeek("dev", 3, 2, 18) },
  ];

  return {
    users,
    chords,
    points,
    goals,
    messages: [...historyMessages, ...messages],
    help_requests: [...historyHelp, ...helpRequests],
    private_messages: [...historyPrivate, ...privateMessages],
  };
}
