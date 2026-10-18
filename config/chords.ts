import type { Audience } from "@/types";

export interface ChordDefinition {
  id: string;
  name: string;
  description: string;
  color: string;
  audience: Audience;
}

/**
 * Chord catalog. To add a subject, append an entry here (see README.md "Creating chords").
 * `id` is used in URLs and in User.subjects, so keep it a stable lowercase slug.
 */
export const CHORD_CATALOG: ChordDefinition[] = [
  { id: "biology", name: "Biology", description: "Cells, genetics, ecology and the living world.", color: "#22a58a", audience: "all" },
  { id: "chemistry", name: "Chemistry", description: "Reactions, bonding, stoichiometry and lab reasoning.", color: "#f08a4b", audience: "all" },
  { id: "physics", name: "Physics", description: "Mechanics, waves, electricity and problem solving.", color: "#4f7cf0", audience: "all" },
  { id: "mathematics", name: "Mathematics", description: "Algebra, calculus, proofs and problem circles.", color: "#8b5cf6", audience: "all" },
  { id: "computer-science", name: "Computer Science", description: "Programming, algorithms and building things.", color: "#0ea5b7", audience: "all" },
  { id: "sat-prep", name: "SAT Preparation", description: "Practice sets, timed drills and test strategy.", color: "#e2578a", audience: "high-school" },
  { id: "engineering", name: "Engineering", description: "Design, materials and applied math for makers.", color: "#64748b", audience: "all" },
  { id: "robotics", name: "Robotics", description: "Sensors, controllers and competition builds.", color: "#84a31a", audience: "all" },
];
