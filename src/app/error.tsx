"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "../components/ui/Button";
import Reveal from "../components/ui/Reveal";

/**
 * Branded fallback for a page that throws while rendering. The header and
 * footer (root layout) stay in place around it. Styled like not-found.tsx.
 */
export default function ErrorPage({
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
    <main className="bg-ivory min-h-screen pt-[84px] flex-grow flex items-center">
      <div className="max-w-[1500px] w-full mx-auto px-6 sm:px-10 lg:px-16 py-24 sm:py-32">
        <Reveal className="max-w-2xl mx-auto text-center">
          <p className="eyebrow text-bronze-deep mb-6">Something went wrong</p>
          <h1 className="font-display font-light text-ink leading-[1.08] text-[clamp(2.5rem,7vw,5rem)]">
            This page didn&apos;t load
          </h1>
          <p className="mt-7 font-sans text-[15px] leading-[1.9] text-muted max-w-md mx-auto">
            It&apos;s usually a passing hiccup on our side. Try again in a moment,
            or head back home and carry on from there.
          </p>
          <div className="mt-11 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Re-fetches the page's data as well as re-rendering it. */}
            <Button variant="solid" size="md" onClick={() => retry()}>
              Try again
            </Button>
            <ButtonLink href="/" variant="outline" size="md">
              Return home
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
