"use client";

import { useEffect } from "react";
import "./globals.css";

/**
 * Last-resort fallback when the root layout itself fails, so it replaces the
 * whole document: no header, footer or providers, and plain links rather than
 * the router. Same look as not-found.tsx, on the stylesheet's fallback fonts.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-ivory text-ink antialiased flex items-center">
        <title>Something went wrong · Genesis by Preethy</title>
        <main className="max-w-2xl w-full mx-auto px-6 py-24 text-center">
          <p className="eyebrow text-bronze-deep mb-6">Something went wrong</p>
          <h1 className="font-display font-light text-ink leading-[1.08] text-[clamp(2.5rem,7vw,5rem)]">
            The site didn&apos;t load
          </h1>
          <p className="mt-7 font-sans text-[15px] leading-[1.9] text-muted max-w-md mx-auto">
            It&apos;s usually a passing hiccup on our side. Try again in a moment.
          </p>
          <div className="mt-11 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => retry()}
              className="font-sans uppercase tracking-[0.18em] text-[11px] px-8 py-4 bg-ink text-ivory hover:bg-forest transition-colors cursor-pointer"
            >
              Try again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the router may be what failed */}
            <a
              href="/"
              className="font-sans uppercase tracking-[0.18em] text-[11px] px-8 py-4 border border-ink/70 text-ink hover:bg-ink hover:text-ivory transition-colors"
            >
              Return home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
