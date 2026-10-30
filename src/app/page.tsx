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
import { fetchActiveBanners } from "../lib/banners";
import { fetchFounderNote } from "../lib/founder";
import { fetchStudioNote } from "../lib/studioNote";
import { fetchActiveCategories, fetchCategorySection } from "../lib/categories";

// Re-rendered at most once a minute, so studio edits show up within that window.
export const revalidate = 60;

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
 *
 * Every studio-edited section is fetched here, on the server, so the first
 * paint already carries the studio's own images and copy — nothing bundled is
 * shown first and swapped out. A section whose data can't be loaded is left
 * out rather than filled with stand-in content.
 */
export default async function Home() {
  const [moment, banners, founderNote, studioNote, categories, categorySection] = await Promise.all([
    fetchMoment(),
    fetchActiveBanners().catch((err) => {
      console.error("Failed to load hero banners", err);
      return [];
    }),
    fetchFounderNote(),
    fetchStudioNote(),
    fetchActiveCategories().catch((err) => {
      console.error("Failed to load categories", err);
      return [];
    }),
    fetchCategorySection(),
  ]);
  return (
    <main className="bg-ivory">
      <HeroSection banners={banners} />
      <ProvenanceStrip />
      <FoundersNote note={founderNote} />
      <CategoryGrid categories={categories} section={categorySection} />
      <TheMoment moment={moment} />
      <MomentExplainer moment={moment} />
      <ProductArchive moment={moment} />
      <StudioNotes note={studioNote} />
      <StudioNewsletter />
    </main>
  );
}
