import { CHORD_CATALOG } from "@/config/chords";
import { MIN_COLLEGE_AGE } from "@/lib/domain/audience";
import { isValidTimeZone } from "@/lib/domain/time";
import type { AvailabilitySlot, EducationLevel, ExperienceLevel, ProfileInput } from "@/types";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const EXPERIENCE: ExperienceLevel[] = ["Beginner", "Intermediate", "Advanced", "Expert"];

function text(form: FormData, key: string, max: number): string {
  return String(form.get(key) ?? "").trim().slice(0, max);
}

/**
 * Parses and validates the profile form used by sign-up and profile editing.
 * Availability values look like "weekday|HH:MM|HH:MM" (one checkbox per slot).
 * Throws a user-readable Error on invalid input.
 */
export function parseProfileForm(form: FormData): ProfileInput {
  const name = text(form, "name", 60);
  if (!name) throw new Error("Name is required.");

  const age = Number(form.get("age"));
  if (!Number.isInteger(age) || age < 10 || age > 99) throw new Error("Enter a valid age.");

  const educationLevel = form.get("educationLevel") as EducationLevel;
  if (educationLevel !== "High School" && educationLevel !== "College") throw new Error("Choose an education level.");
  if (educationLevel === "College" && age < MIN_COLLEGE_AGE) {
    throw new Error(`College students must be ${MIN_COLLEGE_AGE} or older.`);
  }

  const experienceLevel = form.get("experienceLevel") as ExperienceLevel;
  if (!EXPERIENCE.includes(experienceLevel)) throw new Error("Choose an experience level.");

  const timezone = text(form, "timezone", 64) || "UTC";
  if (!isValidTimeZone(timezone)) throw new Error("Choose a valid timezone.");

  const knownChords = new Set(CHORD_CATALOG.map((c) => c.id));
  const subjects = form.getAll("subjects").map(String).filter((s) => knownChords.has(s));

  const availability: AvailabilitySlot[] = form.getAll("availability").flatMap((raw) => {
    const [weekday, start, end] = String(raw).split("|");
    const day = Number(weekday);
    if (!Number.isInteger(day) || day < 0 || day > 6) return [];
    if (!TIME_PATTERN.test(start ?? "") || !TIME_PATTERN.test(end ?? "") || start >= end) return [];
    return [{ weekday: day, start, end }];
  });

  const school = text(form, "school", 80);
  const bio = text(form, "bio", 280);
  const gradeLevel = text(form, "gradeLevel", 40) || (educationLevel === "College" ? "Undergraduate" : "High school");

  return {
    name,
    age,
    educationLevel,
    gradeLevel,
    school: school || undefined,
    bio: bio || undefined,
    subjects,
    experienceLevel,
    timezone,
    availability,
  };
}
