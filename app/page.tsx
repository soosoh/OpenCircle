import { LandingTabs } from "@/components/landing/LandingTabs";
import { CHORD_CATALOG } from "@/config/chords";

// The landing page reads its chord list from the static catalog; the layout
// still resolves the session, so nothing can prerender.
export const instant = false;

const TAB_IDS = new Set(["circle", "chords", "points", "progress"]);

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { tab } = await searchParams;
  const initialTab = typeof tab === "string" && TAB_IDS.has(tab) ? tab : undefined;
  return <LandingTabs chords={CHORD_CATALOG} initialTab={initialTab as never} />;
}
