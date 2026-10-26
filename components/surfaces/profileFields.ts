import type { AvailabilitySlot } from "@/types";

/** The study windows offered on sign-up. A profile edit adds the user's own slots to these. */
export const AVAILABILITY_PRESETS: AvailabilitySlot[] = [
  { weekday: 0, start: "17:00", end: "21:00" },
  { weekday: 2, start: "18:00", end: "21:00" },
  { weekday: 4, start: "16:00", end: "19:00" },
  { weekday: 6, start: "09:00", end: "13:00" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** The value the server's parseProfileForm expects: "weekday|HH:MM|HH:MM". */
export const slotValue = (slot: AvailabilitySlot) => `${slot.weekday}|${slot.start}|${slot.end}`;

function compact(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const hour = h % 12 === 0 ? 12 : h % 12;
  const suffix = h < 12 ? "am" : "pm";
  return m ? `${hour}:${String(m).padStart(2, "0")}${suffix}` : `${hour}${suffix}`;
}

/** "Tue 6–9pm" (the suffix is only repeated when the window crosses noon). */
export function slotLabel(slot: AvailabilitySlot): string {
  const start = compact(slot.start);
  const end = compact(slot.end);
  const startBare = start.replace(/[ap]m$/, "");
  const sameHalf = start.slice(-2) === end.slice(-2);
  return `${DAYS[slot.weekday] ?? "Day"} ${sameHalf ? startBare : start}–${end}`;
}

/** Presets plus any slot the user already has, in week order, each marked if it is theirs. */
export function availabilityOptions(current: AvailabilitySlot[]) {
  const byValue = new Map<string, AvailabilitySlot>();
  for (const slot of [...AVAILABILITY_PRESETS, ...current]) byValue.set(slotValue(slot), slot);
  const owned = new Set(current.map(slotValue));
  return [...byValue.values()]
    .sort((a, b) => a.weekday - b.weekday || a.start.localeCompare(b.start))
    .map((slot) => ({ value: slotValue(slot), label: slotLabel(slot), checked: owned.has(slotValue(slot)) }));
}
