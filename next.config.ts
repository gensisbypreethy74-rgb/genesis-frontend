import type { NextConfig } from "next";

// NEXT_PUBLIC_ values are baked into the browser bundle at build time, so a
// missing or wrong one can't be corrected later: refuse to start or build
// instead of shipping a site that silently calls localhost (or nothing).
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
if (!apiUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_URL must be set: the backend origin, e.g. http://localhost:5000 locally or the Render URL on Vercel."
  );
}
let apiOrigin: URL;
try {
  apiOrigin = new URL(apiUrl);
} catch {
  throw new Error("NEXT_PUBLIC_API_URL is not a valid absolute URL.");
}
if (!/^https?:$/.test(apiOrigin.protocol)) {
  throw new Error("NEXT_PUBLIC_API_URL must start with http:// or https://.");
}
// Every Vercel build (production or preview) is public: it must reach the real backend.
if (process.env.VERCEL && (apiOrigin.protocol !== "https:" || /^(localhost|127\.0\.0\.1)$/.test(apiOrigin.hostname))) {
  throw new Error(`NEXT_PUBLIC_API_URL must be the public https backend on Vercel, not ${apiOrigin.origin}.`);
}

// Without it the sign-in pages can't offer Google; catch that before it ships.
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
if (process.env.NODE_ENV === "production" && !googleClientId?.endsWith(".apps.googleusercontent.com")) {
  throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID must be set to the Google OAuth Web client ID for a production build.");
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/shop",
        destination: "/products",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
