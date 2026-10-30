"use client";

import Link from "next/link";
import Reveal from "../ui/Reveal";
import type { StudioNote } from "../../lib/studioNote";
import { safeHref } from "../../lib/safeHref";

/**
 * `note` is fetched by the home page on the server, so the studio's copy is in
 * the first paint. null (the request failed) leaves only the `#story` anchor,
 * so the nav link still has somewhere to land.
 */
export default function StudioNotes({ note }: { note: StudioNote | null }) {
  if (!note) return <section id="story" aria-hidden className="bg-ivory" />;

  // A link the studio mistyped is dropped rather than rendered.
  const ctaHref = safeHref(note.ctaHref, "");

  return (
    <section id="story" className="bg-ivory">
      <div className="max-w-3xl mx-auto px-6 sm:px-10 section-pad text-center">
        <Reveal>
          <p className="eyebrow text-bronze-deep mb-6">{note.eyebrow}</p>
          <h2 className="font-display font-light leading-[1.12] text-[clamp(1.9rem,4vw,3.1rem)] text-ink mb-8">
            {note.heading}
          </h2>
          {note.description && (
            <p className="font-sans text-[15px] leading-[1.9] text-muted max-w-2xl mx-auto mb-10">
              {note.description}
            </p>
          )}
          {note.ctaLabel && ctaHref && (
            <Link href={ctaHref} className="eyebrow text-ink link-underline">
              {note.ctaLabel}
            </Link>
          )}
        </Reveal>
      </div>
    </section>
  );
}
