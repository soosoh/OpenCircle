import type { Audience, EducationLevel, User } from "@/types";

export const MIN_COLLEGE_AGE = 18;

export const AUDIENCE_OPTIONS: { value: Audience; label: string }[] = [
  { value: "all", label: "All students" },
  { value: "high-school", label: "High school" },
  { value: "college", label: "College (18+)" },
];

/** Normalizes a raw query-string value. Anything unknown means "all". */
export function parseAudience(value: string | null | undefined): Audience {
  return value === "high-school" || value === "college" ? value : "all";
}

/** Maps a user's education level to the audience they belong to. */
export function educationAudience(level: EducationLevel): Audience {
  return level === "College" ? "college" : "high-school";
}

/**
 * Filter check for chords, points, and member search.
 * An entity with audience "all" always matches. A filter of "all" matches everything.
 */
export function matchesAudience(entity: Audience, filter: Audience): boolean {
  return filter === "all" || entity === "all" || entity === filter;
}

export function matchesUserAudience(user: User, filter: Audience): boolean {
  // Same rule as joining: a college filter also requires the 18+ minimum, so member
  // search can never show an under-age "college" profile.
  return canJoinAudience(user, filter).ok;
}

/** Join check: a student may join a group only if their education level matches its audience. */
export function canJoinAudience(user: User, audience: Audience): { ok: true } | { ok: false; reason: string } {
  if (audience === "all") return { ok: true };
  if (educationAudience(user.educationLevel) !== audience) {
    return { ok: false, reason: `This group is for ${audience === "college" ? "college students" : "high school students"}.` };
  }
  if (audience === "college" && user.age < MIN_COLLEGE_AGE) {
    return { ok: false, reason: `College groups require members aged ${MIN_COLLEGE_AGE} or older.` };
  }
  return { ok: true };
}

export function audienceLabel(audience: Audience): string {
  return AUDIENCE_OPTIONS.find((option) => option.value === audience)?.label ?? "All students";
}
