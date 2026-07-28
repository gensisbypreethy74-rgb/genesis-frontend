import Image from "next/image";
import logoBronze from "../../../public/images/logo-wordmark.png";

/**
 * The Genesis by Preethy wordmark — metallic bronze, everywhere.
 *
 * One artwork, one tone: the bronze mark is the brand identity and is used on
 * dark grounds (hero) and ivory/cream grounds (drawer, footer) alike. The old
 * soft-black `ink` variant is retired.
 *
 * Trimmed from `public/images/Logo.png`, whose 1080×1080 canvas is 84% empty
 * padding — sizing that original by height would render the mark tiny.
 */
export default function Logo({
  className = "",
  priority = false,
}: {
  /** Set the height here; width follows the 2.99:1 aspect automatically. */
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={logoBronze}
      alt="Genesis by Preethy"
      priority={priority}
      // Height comes from the caller; `w-auto` keeps the aspect honest.
      className={`w-auto object-contain select-none ${className}`}
      sizes="(max-width: 640px) 140px, 220px"
    />
  );
}
