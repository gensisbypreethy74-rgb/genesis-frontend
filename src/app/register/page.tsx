"use client";

import Link from "next/link";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import EditorialImage from "../../components/ui/EditorialImage";
import Breadcrumbs from "../../components/common/Breadcrumbs";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-ivory pt-[68px] md:pt-[84px] flex flex-col md:flex-row">
      {/* ── Image panel: a mobile image band, a full-height column on desktop ── */}
      <div className="relative w-full h-[38vh] min-h-[260px] md:w-1/2 md:h-auto bg-sand overflow-hidden">
        <EditorialImage
          src="/images/collection-banner.jpg"
          alt="Genesis by Preethy"
          placeholderLabel="Genesis"
          ratio=""
          zoom={false}
          className="h-full w-full"
        />
        {/* Scrim keeps the type legible over any photograph. */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-14 lg:p-20 pointer-events-none">
          <p className="eyebrow text-ivory/85 mb-3">The Onam Collection · 2026</p>
          <p className="font-display font-light text-xl sm:text-2xl md:text-3xl leading-[1.15] text-ivory max-w-sm">
            Made for 32°C, humidity, and monsoon. Named for the flowers of Kerala.
          </p>
        </div>
      </div>

      {/* ── Form panel: Google-only registration ── */}
      <div className="flex-1 md:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 md:p-16 lg:p-24">
        <div className="max-w-md mx-auto w-full">
          <Breadcrumbs className="mb-8" />
          <p className="eyebrow text-bronze-deep mb-5">Account</p>

          <h1 className="font-display font-light text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.08] text-ink mb-4">
            Create your account.
          </h1>

          <p className="font-sans text-muted text-base leading-relaxed mb-10">
            Sign up with Google for a faster checkout, saved addresses, and a
            place to follow your orders.
          </p>

          {/* Google SSO */}
          <div className="mb-10">
            <GoogleAuthButton mode="register" />
          </div>

          <div className="border-t border-line pt-8">
            <Link
              href="/sign-in"
              className="font-sans text-sm text-muted hover:text-ink transition-colors"
            >
              Already have an account?{" "}
              <span className="link-underline text-ink">Sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
