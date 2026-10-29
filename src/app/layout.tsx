import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { SITE_URL } from "../lib/contact";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Genesis by Preethy – Tropical-Intelligent Clothing",
    template: "%s · Genesis by Preethy",
  },
  description:
    "Natural clothing for tropical climates, designed in Kochi for heat, humidity and rain. Considered production, not mass volume.",
  openGraph: {
    images: [
      {
        url: '/images/og-image.png',
        width: 848,
        height: 766,
        alt: 'Genesis by Preethy'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/og-image.png'],
  },
};

import { CartProvider } from "../context/CartContext";
import { ToastProvider } from "../context/ToastContext";
import { SettingsProvider } from "../context/SettingsContext";
import GoogleOAuthWrapper from "../components/auth/GoogleOAuthWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative bg-ivory text-ink" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:bg-ink focus:text-ivory focus:px-5 focus:py-3 eyebrow"
        >
          Skip to content
        </a>
        {/* "user": framer-motion follows the OS reduce-motion setting itself, so
            every component renders the same markup on server and client. */}
        <MotionConfig reducedMotion="user">
          <ToastProvider>
            <SettingsProvider>
              <CartProvider>
                <GoogleOAuthWrapper>
                  <Navbar />
                  {/* Skip-link target: focus lands here, past the header. */}
                  <div id="main-content" tabIndex={-1} className="outline-none" />
                  {children}
                  <Footer />
                </GoogleOAuthWrapper>
              </CartProvider>
            </SettingsProvider>
          </ToastProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
