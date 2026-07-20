"use client";

import Reveal from "../ui/Reveal";
import EditorialImage from "../ui/EditorialImage";
import { ButtonLink } from "../ui/Button";

export default function StorySection() {
  return (
    <section id="the-moment" className="bg-ivory">
      {/* The Moment — image + narrative */}
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 section-pad">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <Reveal scaleFrom={0.97} className="group">
            <EditorialImage
              src="/products/test-1.jpg"
              placeholderLabel="The Designer"
              alt="Preethy at work in the Genesis studio in Kochi"
              ratio="aspect-[4/5]"
            />
          </Reveal>

          <Reveal delay={0.1}>
            <p className="eyebrow text-bronze-deep mb-6">The Moment · Genesis by Preethy</p>
            <h2 className="font-display font-light leading-[1.08] text-[clamp(2rem,4.2vw,3.4rem)] text-ink mb-7">
              A house begun by a woman who spent nineteen years shaping how rooms make
              people feel.
            </h2>
            <div className="space-y-5 max-w-xl">
              <p className="font-sans text-[15px] leading-[1.85] text-muted">
                For nineteen years, Preethy read light, proportion and material for a
                living — how a space should hold a person, where a line should fall, what a
                surface should do in the heat of the afternoon. Clothing, it turned out, was
                the same discipline worn closer to the body.
              </p>
              <p className="font-sans text-[15px] leading-[1.85] text-muted">
                Genesis is designed in Kochi for the heat, the humidity and the monsoon that
                shape real days here — and for the woman over forty who has stopped dressing
                to be noticed and started dressing to be herself.
              </p>
            </div>
            <div className="mt-9">
              <ButtonLink href="/products" variant="outline" size="md">
                View the Collection
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Pull quote */}
      <div className="bg-tan">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 section-pad text-center">
          <Reveal>
            <p className="font-display font-light italic leading-[1.2] text-[clamp(1.7rem,3.8vw,2.8rem)] text-ink">
              &ldquo;I did not want clothing that performs. I wanted clothing that lets a
              woman look like herself — with more ease, and more precision, than
              before.&rdquo;
            </p>
            <p className="eyebrow text-bronze-deep mt-8">Preethy · Founder</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
