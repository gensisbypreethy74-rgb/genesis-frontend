"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <title>Privacy Policy – NEOKART</title>
      <meta
        name="description"
        content="Read the Privacy Policy of NEOKART. Learn how we collect, use, and protect your data."
      />

      <main id="top" className="min-h-screen bg-[#0a0a0a]">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section
          className="relative w-full pt-32 md:pt-40 pb-36 md:pb-48"
          style={{
            background:
              "linear-gradient(135deg, #0a0a0a 0%, #4a3391 50%, #593dab 100%)",
          }}
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            {/* Mobile Back to Home */}
            <div
              className="md:hidden flex justify-center mb-8"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(1rem)",
                transition: "opacity 0.5s ease 50ms, transform 0.5s ease 50ms",
              }}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-semibold bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full border border-white/20 backdrop-blur-sm shadow-sm"
              >
                <ChevronLeft size={16} />
                Back to Home
              </Link>
            </div>

            {/* Headline */}
            <h1
              className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(1rem)",
                transition:
                  "opacity 0.6s ease 200ms, transform 0.6s ease 200ms",
              }}
            >
              Privacy Policy
            </h1>

            {/* Subheadline */}
            <p
              className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(1rem)",
                transition:
                  "opacity 0.6s ease 300ms, transform 0.6s ease 300ms",
              }}
            >
              We value your privacy and are committed to protecting your personal information under the applicable data-protection laws of India.
            </p>
          </div>
        </section>

        {/* ── Content ──────────────────────────────────────────────── */}
        <section
          className="relative z-10 px-6 md:px-12 lg:px-20 max-w-4xl mx-auto -mt-20 md:-mt-24 mb-20"
        >
          <div className="bg-[#aea3cf] rounded-3xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] p-8 md:p-12 lg:p-16 border border-black/10">
            <p className="text-slate-700 mb-8 font-medium">Last Updated: July 11, 2026</p>

            <div className="space-y-8 text-slate-700 leading-relaxed font-sans">
              <p>
                At Neokart, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your information when you visit our website or purchase our products. This policy is governed by the Information Technology Act, 2000, the Digital Personal Data Protection Act, 2023, and other applicable laws of India.
              </p>

              <section>
                <h2 className="text-2xl font-bold text-[#4a3391] mb-4">1. Information We Collect</h2>
                <p className="mb-4">We may collect:</p>
                <ul className="list-disc pl-6 space-y-2 marker:text-[#4a3391]">
                  <li>Name</li>
                  <li>Mobile number</li>
                  <li>Email address</li>
                  <li>Billing and shipping address</li>
                  <li>Order and purchase details</li>
                  <li>Payment information (processed through secure payment providers)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#4a3391] mb-4">2. How We Use Your Information</h2>
                <p className="mb-4">Your information is used to:</p>
                <ul className="list-disc pl-6 space-y-2 marker:text-[#4a3391]">
                  <li>Process and deliver your orders</li>
                  <li>Confirm COD orders</li>
                  <li>Provide customer support and warranty services</li>
                  <li>Send order updates and important notifications</li>
                  <li>Improve our products and services</li>
                  <li>Prevent fraud and comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#4a3391] mb-4">3. Information Sharing</h2>
                <p className="mb-4">We do not sell or rent your personal information.</p>
                <p className="mb-4">Your information may be shared only with:</p>
                <ul className="list-disc pl-6 space-y-2 marker:text-[#4a3391]">
                  <li>Courier and logistics partners</li>
                  <li>Payment gateway providers</li>
                  <li>Service providers assisting our business</li>
                  <li>Government authorities when required by law</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#4a3391] mb-4">4. Data Security</h2>
                <p>
                  We use reasonable security measures to protect your personal information. However, no online system is completely secure, and absolute security cannot be guaranteed.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#4a3391] mb-4">5. Cookies</h2>
                <p>
                  Our website may use cookies to improve your browsing experience and analyze website traffic. You may disable cookies through your browser settings if you prefer.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#4a3391] mb-4">6. Your Rights</h2>
                <p className="mb-4">Subject to applicable law, you may request to:</p>
                <ul className="list-disc pl-6 space-y-2 marker:text-[#4a3391]">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion where legally permitted</li>
                  <li>Withdraw consent for marketing communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#4a3391] mb-4">7. Third-Party Websites</h2>
                <p>
                  Our website may contain links to third-party websites. Neokart is not responsible for their privacy practices or content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#4a3391] mb-4">8. Policy Updates</h2>
                <p>
                  We may update this Privacy Policy from time to time. Any changes will be published on this page with the revised effective date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#4a3391] mb-4">Contact Us</h2>
                <p className="mb-4">
                  <span className="font-semibold text-slate-900">NEOKART</span><br />
                  A.M. Motors Building<br />
                  Near Check Post, Chungam<br />
                  Thamarassery, Calicut, Kerala – 673573
                </p>
                <p className="mb-2">
                  Phone:{" "}
                  <a href="tel:+916235251520" className="text-[#4a3391] hover:text-[#593dab] font-medium transition-colors">+91 62352 51520</a>{" "}/{" "}
                  <a href="tel:+916235251523" className="text-[#4a3391] hover:text-[#593dab] font-medium transition-colors">+91 62352 51523</a>{" "}/{" "}
                  <a href="tel:+916235251544" className="text-[#4a3391] hover:text-[#593dab] font-medium transition-colors">+91 62352 51544</a>
                </p>
                <p>Email: <a href="mailto:neokart.shopy@gmail.com" className="text-[#4a3391] hover:text-[#593dab] font-medium transition-colors">neokart.shopy@gmail.com</a></p>
              </section>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}