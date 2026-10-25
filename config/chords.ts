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
  { id: "biology", name: "Biology", description: "Cells, genetics, ecology and the living world.", color: "#2E7D5B", audience: "all" },
  { id: "chemistry", name: "Chemistry", description: "Reactions, bonding, stoichiometry and lab reasoning.", color: "#B85C1E", audience: "all" },
  { id: "physics", name: "Physics", description: "Mechanics, waves, electricity and problem solving.", color: "#2D6A73", audience: "all" },
  { id: "mathematics", name: "Mathematics", description: "Algebra, calculus, proofs and problem circles.", color: "#8C3A22", audience: "all" },
  { id: "computer-science", name: "Computer Science", description: "Programming, algorithms and building things.", color: "#4F6B2A", audience: "all" },
  { id: "sat-prep", name: "SAT Preparation", description: "Practice sets, timed drills and test strategy.", color: "#A83A50", audience: "high-school" },
  { id: "engineering", name: "Engineering", description: "Design, materials and applied math for makers.", color: "#5A4632", audience: "all" },
  { id: "robotics", name: "Robotics", description: "Sensors, controllers and competition builds.", color: "#7A6A12", audience: "all" },
];
