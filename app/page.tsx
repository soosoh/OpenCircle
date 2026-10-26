import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/session";
import { LandingTabs } from "@/components/landing/LandingTabs";
import { CHORD_CATALOG } from "@/config/chords";
import { WEEKDAY_NAMES, nextWeeklyOccurrence } from "@/lib/domain/time";
import { listChords, listGoals, listMessages, listPoints, listUsers } from "@/lib/database/repository";
import type { LandingPanel } from "@/components/landing/mockups";
import type { Point } from "@/types";

// The landing previews the real after-sign-in surfaces, so it reads the seed
// store the way the dashboard does; the layout still resolves the session.
export const instant = false;

const TAB_IDS = new Set(["circle", "chords", "points", "progress"]);

/** The point the landing tours the audience through inside its windows. */
const FEATURED_POINT_ID = "ap-bio-genetics";
/** The member whose dashboard gets shown. */
const HERO_USER_ID = "dev";

function buildPanel(
  chords: Awaited<ReturnType<typeof listChords>>,
  points: Awaited<ReturnType<typeof listPoints>>,
  users: Awaited<ReturnType<typeof listUsers>>,
  goals: Awaited<ReturnType<typeof listGoals>>,
  messages: Awaited<ReturnType<typeof listMessages>>,
): LandingPanel {
  const userById = new Map(users.map((user) => [user.id, user]));
  const brief = { name: "", color: "" };
  const avatarOf = (id: string) => {
    const user = userById.get(id);
    return user ? { name: user.name, color: user.avatarColor } : { ...brief };
  };

  // --- The dashboard you sign into (the hero member's real data). ---
  const hero = userById.get(HERO_USER_ID) ?? users[0];
  const heroPoints = points.filter(
    (point) => point.memberIds.includes(hero.id) || point.moderatorId === hero.id,
  );
  const heroGoals = goals
    .filter((goal) => heroPoints.some((point) => point.id === goal.pointId))
    .map((goal) => ({
      label: goal.title,
      value: Math.round(
        goal.assignments.reduce((sum, assignment) => sum + assignment.progress, 0) /
          Math.max(goal.assignments.length, 1),
      ),
    }))
    .filter((goal) => goal.value > 0)
    .slice(0, 3);
  const goalAverage = Math.round(
    heroGoals.reduce((sum, goal) => sum + goal.value, 0) / Math.max(heroGoals.length, 1),
  );
  const nextOf = (point: Point) => nextWeeklyOccurrence(point.schedule);
  const nextPoint = [...heroPoints].sort((a, b) => nextOf(a).getTime() - nextOf(b).getTime())[0];
  const whenLabel = (point: Point) => {
    const zone = hero.timezone;
    const when = nextOf(point);
    const weekday = WEEKDAY_NAMES[point.schedule.weekday].slice(0, 3);
    const time = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hour: "numeric",
      minute: "2-digit",
    }).format(when);
    return `${weekday} ${time}`;
  };

  // --- The chords index preview. ---
  const chordCards = CHORD_CATALOG.map((chord) => {
    const record = chords.find((entry) => entry.id === chord.id);
    const chordPoints = points.filter((point) => point.chordId === chord.id);
    const stack = (record?.memberIds ?? [])
      .slice(0, 4)
      .map(avatarOf)
      .filter((avatar) => avatar.name);
    return {
      id: chord.id,
      name: chord.name,
      color: chord.color,
      points: chordPoints.length,
      members: stack.length,
      stack,
      audience: chord.audience,
    };
  });

  // One chip per chord the hero belongs to, in first-seen order.
  const seenChords = new Set<string>();
  const heroChords: { id: string; label: string; color: string }[] = [];
  for (const point of heroPoints) {
    const card = chordCards.find((entry) => entry.id === point.chordId);
    if (card && !seenChords.has(card.id)) {
      seenChords.add(card.id);
      heroChords.push({ id: card.id, label: card.name, color: card.color });
    }
  }

  // --- The featured point room. ---
  const featured = points.find((point) => point.id === FEATURED_POINT_ID) ?? points[0];
  const featuredChord = CHORD_CATALOG.find((chord) => chord.id === featured.chordId);
  const featuredGoals = goals
    .filter((goal) => goal.pointId === featured.id)
    .map((goal) => ({
      label: goal.title,
      value: Math.round(
        goal.assignments.reduce((sum, assignment) => sum + assignment.progress, 0) /
          Math.max(goal.assignments.length, 1),
      ),
    }));
  const featuredChat = messages
    .filter((message) => message.pointId === featured.id)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .slice(-2)
    .reverse()
    .map((message) => {
      const sender = userById.get(message.senderId);
      return {
        name: sender?.name ?? "Member",
        color: sender?.avatarColor ?? "#F0502C",
        text: message.content,
        kind: message.kind,
      };
    });

  return {
    dashboard: {
      user: { name: hero.name, color: hero.avatarColor },
      chords: heroChords,
      points: heroPoints.slice(0, 4).map((point) => {
        const chord = chordCards.find((card) => card.id === point.chordId);
        return {
          title: point.title,
          chord: chord?.name ?? featuredChord?.name ?? "Circle",
          chordColor: chord?.color ?? "#FFC300",
          meets: whenLabel(point),
          members: point.memberIds.slice(0, 3).map(avatarOf),
        };
      }),
      goals: heroGoals,
      average: goalAverage,
      next: {
        title: nextPoint?.title ?? "Your next meetup",
        when: nextPoint ? whenLabel(nextPoint) : "this week",
        members: (nextPoint?.memberIds.length ?? 0) + 1,
      },
    },
    chords: { cards: chordCards },
    point: {
      title: featured.title,
      chord: { name: featuredChord?.name ?? "Circle", color: featuredChord?.color ?? "#22a58a" },
      schedule: `${WEEKDAY_NAMES[featured.schedule.weekday]} · ${format12h(featured.schedule.time)}`,
      zone: featured.schedule.timezone,
      moderator: avatarOf(featured.moderatorId),
      members: featured.memberIds.map(avatarOf),
      goals: featuredGoals,
      chat: featuredChat,
      meetingId: featured.meeting.meetingId,
    },
  };
}

/** "19:00" -> "7:00 PM" without dragging a date parser into the landing. */
function format12h(time: string): string {
  const [rawHour, rawMinute] = time.split(":");
  const hour = Number(rawHour);
  const suffix = hour >= 12 ? "PM" : "AM";
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelve}:${rawMinute} ${suffix}`;
}

export default async function HomePage({ searchParams }: PageProps<"/">) {
  // The panel computes next meetings against "now"; the render is dynamic.
  await connection();
  // Signed-in members never see the marketing page: their home is the dashboard
  // until they sign out. Only a resolved profile counts (a stale cookie must not
  // bounce between here and /login).
  if (await getCurrentUser()) redirect("/dashboard");
  const { tab } = await searchParams;
  const initialTab = typeof tab === "string" && TAB_IDS.has(tab) ? tab : undefined;
  const [chords, points, users, goals, messages] = await Promise.all([
    listChords(),
    listPoints(),
    listUsers(),
    listGoals(),
    listMessages(),
  ]);
  const panel = buildPanel(chords, points, users, goals, messages);
  return <LandingTabs chords={CHORD_CATALOG} initialTab={initialTab as never} panel={panel} />;
}
