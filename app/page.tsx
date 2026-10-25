import { LandingTabs } from "@/components/landing/LandingTabs";
import { CHORD_CATALOG } from "@/config/chords";

// The landing page reads its chord list from the static catalog; the layout
// still resolves the session, so nothing can prerender.
export const instant = false;

export default function HomePage() {
  return <LandingTabs chords={CHORD_CATALOG} />;
}
