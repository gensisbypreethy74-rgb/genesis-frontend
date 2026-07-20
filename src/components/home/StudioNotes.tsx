"use client";

import Link from "next/link";
import Reveal from "../ui/Reveal";

export default function StudioNotes() {
  return (
    <section id="story" className="bg-ivory">
      <div className="max-w-3xl mx-auto px-6 sm:px-10 section-pad text-center">
        <Reveal>
          <p className="eyebrow text-bronze-deep mb-6">Story · Studio Notes — The Designer's Eye</p>
          <h2 className="font-display font-light leading-[1.12] text-[clamp(1.9rem,4vw,3.1rem)] text-ink mb-8">
            The line begins where weather, body and proportion meet.
          </h2>
          <p className="font-sans text-[15px] leading-[1.9] text-muted max-w-2xl mx-auto mb-10">
            Every Genesis piece is shaped through three questions: does it serve the woman
            over forty, will it breathe in heat and monsoon air, and does it give her identity
            without asking her to perform. Nineteen years of an interior designer's eye,
            turned toward clothing.
          </p>
          <Link href="/products" className="eyebrow text-ink link-underline">
            View the Collection
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
