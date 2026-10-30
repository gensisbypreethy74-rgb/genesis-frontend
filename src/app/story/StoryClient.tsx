"use client";

import Breadcrumbs from "../../components/common/Breadcrumbs";
import FoundersNote from "../../components/home/FoundersNote";
import StorySectionView from "../../components/story/StorySectionView";
import type { StoryPayload } from "../../lib/story";
import type { FounderNote } from "../../lib/founder";

/**
 * Both props are fetched by the page on the server. Only the studio's own
 * published sections are shown — there is no bundled stand-in story.
 */
export default function StoryClient({
  payload,
  founderNote,
}: {
  payload: StoryPayload | null;
  founderNote: FounderNote | null;
}) {
  const sections = payload?.sections ?? [];
  const settings = payload?.settings ?? {};

  const introEyebrow = settings.introEyebrow || "Our Story";

  return (
    <main className="bg-ivory">
      {/* Intro section — centred label, heading and description */}
      <div className="pt-[92px] lg:pt-[116px]">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16">
          <Breadcrumbs />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center pt-5 sm:pt-8 pb-4 sm:pb-6">
          <p className="eyebrow text-bronze-deep">{introEyebrow}</p>
          {settings.introHeading && (
            <h1 className="font-display font-light leading-[1.1] text-[clamp(1.9rem,4.5vw,3.1rem)] text-ink mt-4">
              {settings.introHeading}
            </h1>
          )}
          {settings.introDescription && (
            <p className="font-sans text-[15px] leading-[1.85] text-muted max-w-xl mx-auto mt-4">
              {settings.introDescription}
            </p>
          )}
        </div>
      </div>

      {/* Fixed on this page. It reads the same `/founder-note` singleton the
          Home page shows, so editing it under Founder's Note in the admin
          updates both. */}
      <FoundersNote note={founderNote} />

      {/* Admin-managed content — the sections below are theirs to compose. */}
      {sections.map((s) => <StorySectionView key={s._id} section={s} />)}

      {!payload && (
        <p className="max-w-3xl mx-auto px-6 pb-20 text-center font-sans text-sm text-muted">
          The story couldn&apos;t be loaded right now. Please refresh the page.
        </p>
      )}
    </main>
  );
}
