"use client";

import Reveal from "../ui/Reveal";

const ITEMS = [
  {
    title: "Designed in Kochi",
    body: "Kerala weather, architectural lines, a designer's eye.",
  },
  {
    title: "Made for 32°C Humidity",
    body: "Breathable structure for real monsoon days.",
  },
  {
    title: "Considered Production",
    body: "Made in considered quantities, not mass volume.",
  },
];

export default function ProvenanceStrip() {
  return (
    <section className="bg-tan">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 py-7 sm:py-9">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-16">
          {ITEMS.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 0.12}
              className="text-center sm:text-left"
            >
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="text-bronze text-base leading-none">+</span>
                <h3 className="eyebrow text-ink">{item.title}</h3>
              </div>
              <p className="font-display text-[17px] sm:text-[18px] leading-snug text-muted max-w-xs mx-auto sm:mx-0">
                {item.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
