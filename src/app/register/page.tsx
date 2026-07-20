"use client";

import Link from "next/link";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import EditorialImage from "../../components/ui/EditorialImage";
import Breadcrumbs from "../../components/common/Breadcrumbs";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-ivory pt-[84px] flex flex-col md:flex-row">
      {/* ── Left Panel: Editorial image / brand ── */}
      <div className="relative md:w-1/2 bg-sand">
        <EditorialImage
          src="/images/collection-banner.jpg"
          alt="Genesis by Preethy"
          placeholderLabel="Genesis"
          ratio="aspect-[4/5] md:aspect-auto md:h-full"
          zoom={false}
          className="h-64 md:h-full"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 lg:p-20 pointer-events-none">
          <p className="eyebrow text-bronze-deep mb-4">The Onam Collection · 2026</p>
          <p className="font-display font-light text-2xl md:text-3xl leading-[1.15] text-ink max-w-sm">
            Made for 32°C, humidity, and monsoon. Named for the flowers of Kerala.
          </p>
        </div>
      </div>

      {/* ── Right Panel: Google-only Registration ── */}
      <div className="md:w-1/2 flex flex-col justify-center px-6 py-16 sm:px-10 md:p-16 lg:p-24">
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
