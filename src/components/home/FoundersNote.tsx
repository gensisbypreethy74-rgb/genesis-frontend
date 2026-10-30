"use client";

import { motion } from "framer-motion";
import EditorialImage from "../ui/EditorialImage";
import type { FounderNote } from "../../lib/founder";

const ease = [0.16, 1, 0.3, 1] as const;

// Same markup on server and client; reduced motion is handled by the root
// MotionConfig, which drops the slide and keeps the fade.
const fromLeft = { initial: { opacity: 0, x: -40 }, whileInView: { opacity: 1, x: 0 } };
const fromRight = { initial: { opacity: 0, x: 40 }, whileInView: { opacity: 1, x: 0 } };

/**
 * `note` is fetched by the page on the server, so the studio's portrait and
 * copy are in the first paint — there is no bundled version to flash first.
 * null (the request failed) leaves the section out; a note without an image
 * keeps the frame with the neutral placeholder tone.
 */
export default function FoundersNote({ note }: { note: FounderNote | null }) {
  if (!note) return null;

  return (
    <section className="bg-ivory">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 section-pad">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Portrait */}
          <motion.div
            {...fromLeft}
            viewport={{ once: true, margin: "0px 0px -12% 0px" }}
            transition={{ duration: 0.9, ease }}
            className="group"
          >
            {/* Capping the width on tablet (md) and desktop (lg) shortens the
                portrait proportionally — same 4:5 aspect ratio, no crop, no
                quality loss — and mx-auto keeps it balanced in its column.
                Mobile keeps the full-width portrait. */}
            <EditorialImage
              src={note.image}
              placeholderLabel="Founder Portrait"
              alt={note.heading}
              ratio="aspect-[4/5]"
              className="mx-auto md:max-w-[380px] lg:max-w-[460px]"
            />
          </motion.div>

          {/* Text */}
          <motion.div
            {...fromRight}
            viewport={{ once: true, margin: "0px 0px -12% 0px" }}
            transition={{ duration: 0.9, delay: 0.1, ease }}
          >
            <p className="eyebrow text-bronze-deep mb-6">{note.eyebrow}</p>
            <h2 className="font-display font-light leading-[1.1] text-[clamp(2rem,4vw,3.25rem)] text-ink mb-8">
              {note.heading}
            </h2>
            <div className="space-y-5 max-w-xl">
              {note.body1 && <p className="font-sans text-[15px] leading-[1.85] text-muted">{note.body1}</p>}
              {note.body2 && <p className="font-sans text-[15px] leading-[1.85] text-muted">{note.body2}</p>}
            </div>
            {note.signature && <p className="font-display italic text-2xl text-ink mt-8">{note.signature}</p>}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
