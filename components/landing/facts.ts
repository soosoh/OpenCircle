import type { ChordDefinition } from "@/config/chords";

/**
 * The landing-page fact bible. Every mockup "screenshot" and float card reads
 * its numbers from here, so no surface can contradict another. These are also
 * the numbers the real logged-in dashboard should agree with once it exists.
 * When something changes, change it here, once.
 */
export const FACTS = {
  point: "Evening Circles Point",
  schedule: "Every Sunday · 6:00 PM",
  time: "Sunday 6:00 PM",
  members: 6,
  moderators: 1,
  streak: 6,
  personalBest: 11,
  goals: [
    { label: "Finish Chapter 4 problem set", value: 80 },
    { label: "Draft the lab writeup", value: 45 },
    { label: "Read two papers for seminar", value: 25 },
  ],
} as const;

/** Average across FACTS.goals — the "Goal progress" float card's number. */
export const AVERAGE_GOAL = Math.round(
  FACTS.goals.reduce((sum, goal) => sum + goal.value, 0) / FACTS.goals.length,
);

/**
 * Chord facts vary per chord so the browse list doesn't repeat itself, but they
 * are deterministic — the same chord always shows the same numbers.
 */
export function chordMeta(chord: ChordDefinition) {
  const n = chord.id.length;
  return {
    points: 2 + (n % 4),
    members: 8 + ((n * 5) % 10),
  };
}

/** One cell = one weekly meetup. A 5-week run, one miss, then 6 straight. */
export const MEETUP_WEEKS = [4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4] as const;
