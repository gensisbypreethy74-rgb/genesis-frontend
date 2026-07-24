import HeroSection from "../components/home/HeroSection";
import ProvenanceStrip from "../components/home/ProvenanceStrip";
import FoundersNote from "../components/home/FoundersNote";
import CategoryGrid from "../components/home/CategoryGrid";
import ProductArchive from "../components/home/ProductArchive";
import TheMoment from "../components/home/TheMoment";
import MomentExplainer from "../components/home/MomentExplainer";
import StudioNotes from "../components/home/StudioNotes";
import StudioNewsletter from "../components/home/StudioNewsletter";
import { fetchMoment } from "../lib/moment";

export const dynamic = "force-dynamic";

/**
 * Single-page site. Home section order:
 *   1. Hero
 *   2. Provenance Strip
 *   3. Founder's Note
 *   4. The Edit            (CategoryGrid,   id="the-edit")  — live categories
 *   5. The Moment          (TheMoment,      id="the-moment") — dark launch block
 *   6. Moment Explainer    (MomentExplainer) — how the drop model works
 *   7. The Archive         (ProductArchive, id="the-archive") — collection carousel
 *   8. Story               (StudioNotes,    id="story")     — Studio Notes · The Designer's Eye
 *   9. Newsletter
 *   10. Footer (global, app/layout.tsx)
 *
 * Nav (The Edit · The Moment · Story) scrolls to sections #the-edit / #the-moment / #story.
 */
export default async function Home() {
  const moment = await fetchMoment();
  return (
    <main className="bg-ivory">
      <HeroSection />
      <ProvenanceStrip />
      <FoundersNote />
      <CategoryGrid />
      <TheMoment moment={moment} />
      <MomentExplainer moment={moment} />
      <ProductArchive />
      <StudioNotes />
      <StudioNewsletter />
    </main>
  );
}
