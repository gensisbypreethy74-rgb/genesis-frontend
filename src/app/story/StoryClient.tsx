"use client";

import Breadcrumbs from "../../components/common/Breadcrumbs";
import FoundersNote from "../../components/home/FoundersNote";
import StorySectionView from "../../components/story/StorySectionView";
import { type StoryPayload, type StorySection } from "../../lib/story";

/**
 * Static fallback content — shown until the admin publishes its own sections, so
 * the page is never empty. Once any section is published, the admin's content
 * takes over entirely. Rendered through the same StorySectionView as live data.
 */
const FALLBACK_SECTIONS: StorySection[] = [
  {
    _id: "fallback-within",
    type: "text",
    eyebrow: "Within",
    title: "At-Home Identity, without an audience.",
    body: "Clothes for the hours that belong only to you — the ones no one else sees. Unstructured, breathable, cut for a house in Kerala heat rather than a room full of people.",
    tagline: "Some clothes ask you to perform. This kaftan asks you to sit down.",
    ctaLabel: "Shop Within",
    ctaHref: "/the-edit/within",
    image: "/images/story-within.png",
    imageAlt: "A woman in a flowing red kaftan in a teal-walled interior with a brass Genesis sign",
    order: 0,
    status: "PUBLISHED",
  },
  {
    _id: "fallback-beyond",
    type: "text",
    eyebrow: "Beyond",
    title: "For the life lived beyond the threshold.",
    body: "Ambition, Occasion, Casual/Out — the three modes that meet the world. Structured where work asks for it, fluid where an evening does, easy where a Saturday needs nothing more.",
    tagline: "She wore it to her son's reception. Then to a Sunday brunch. Then once again, alone, to the temple.",
    ctaLabel: "Shop Beyond",
    ctaHref: "/the-edit/beyond",
    image: "/images/story-beyond.png",
    imageAlt: "A woman in a cream silk outfit seated among blue-and-white porcelain vases",
    order: 1,
    status: "PUBLISHED",
  },
  {
    _id: "fallback-archives",
    type: "text",
    eyebrow: "Archives",
    title: "Never discounted. Never rushed.",
    body: "Past Seasons, kept for sale and never marked down. When a Season closes, its pieces move here — same page, same photography, simply re-tagged, and fully available to buy.",
    tagline: "Nothing here is discounted, and nothing is rushed.",
    ctaLabel: "View Archives",
    ctaHref: "/the-edit/archive",
    image: "/images/story-archives.png",
    imageAlt: "A woman in a white, coral and burgundy colour-block dress against a white shuttered wall",
    order: 2,
    status: "PUBLISHED",
  },
  {
    _id: "fallback-genesis-man",
    type: "text",
    eyebrow: "Genesis Man",
    title: "The same quiet conviction. A new set of shoulders.",
    body: "Genesis Man extends the founding philosophy to the underserved man over forty — the same three laws, the same four life modes, applied rather than diluted. It is an addition, not a rebrand.",
    tagline: "Make clothing for the man who notices the seam.",
    ctaLabel: "View Genesis Men",
    ctaHref: "/the-edit/genesis-man",
    image: "/images/story-genesis-man.png",
    imageAlt: "A model in a white embroidered column dress against a green wall with potted plants",
    order: 3,
    status: "PUBLISHED",
  },
  {
    _id: "fallback-cta",
    type: "cta",
    eyebrow: "The Genesis Studio · Coming Soon",
    title: "Image consulting and personal styling, led by Preethy.",
    body: "The second half of Genesis, opening in a considered Year One rollout.",
    ctaLabel: "Explore the Edit",
    ctaHref: "/#the-edit",
    order: 4,
    status: "PUBLISHED",
  },
];

export default function StoryClient({ payload }: { payload: StoryPayload | null }) {
  const sections = payload?.sections ?? [];
  const hasLive = sections.length > 0;
  const settings = payload?.settings ?? {};

  const introEyebrow = settings.introEyebrow || "Story · Genesis by Preethy";

  return (
    <main className="bg-ivory">
      {/* Slim top strip — clears the fixed header and orients the visitor */}
      <div className="pt-[100px] lg:pt-[128px]">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16">
          <Breadcrumbs />
          <p className="eyebrow text-bronze-deep mt-6">{introEyebrow}</p>
          {settings.introHeading && (
            <h1 className="font-display font-light leading-[1.05] text-[clamp(2rem,4.5vw,3.5rem)] text-ink max-w-4xl mt-4">
              {settings.introHeading}
            </h1>
          )}
        </div>
      </div>

      {hasLive ? (
        // Admin-managed content — the full page is theirs to compose.
        sections.map((s) => <StorySectionView key={s._id} section={s} />)
      ) : (
        // Default editorial content until the studio publishes its own.
        <>
          <FoundersNote />
          {FALLBACK_SECTIONS.map((s) => (
            <StorySectionView key={s._id} section={s} />
          ))}
        </>
      )}
    </main>
  );
}
