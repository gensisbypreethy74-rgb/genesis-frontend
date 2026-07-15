"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function TermsAndConditionsPage() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <title>Terms & Conditions – NEOKART</title>
      <meta
        name="description"
        content="Read the Terms & Conditions of NEOKART. Learn about the rules and regulations for using our website."
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
              Terms & Conditions
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
              By accessing our website or placing an order, you agree to the following Terms & Conditions, governed by the applicable laws of India.
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
                Welcome to Neokart. By accessing our website or placing an order, you agree to the following Terms &amp; Conditions. These terms are governed by the applicable laws of India, including the Information Technology Act, 2000, the Consumer Protection Act, 2019, and other applicable laws and regulations.
              </p>

              <section>
                <h2 className="text-2xl font-bold text-[#4a3391] mb-4">1. Order Confirmation</h2>
                <ul className="list-disc pl-6 space-y-2 marker:text-[#4a3391]">
                  <li>Customers must provide accurate shipping details and a valid contact number while placing an order.</li>
                  <li>To confirm Cash on Delivery (COD) orders, an advance payment of 10% of the product value is required. The remaining amount is payable at the time of delivery.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#4a3391] mb-4">2. Delivery</h2>
                <ul className="list-disc pl-6 space-y-2 marker:text-[#4a3391]">
                  <li>Prepaid Orders: Estimated delivery within 2–3 business days.</li>
                  <li>Cash on Delivery (COD): Estimated delivery within 3–5 business days.</li>
                  <li>Delivery timelines are estimates and may vary depending on location, courier availability, or unforeseen circumstances.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#4a3391] mb-4">3. Unboxing &amp; Delivery Claims</h2>
                <ul className="list-disc pl-6 space-y-2 marker:text-[#4a3391]">
                  <li>Customers are kindly requested to record a continuous unboxing video while opening the package.</li>
                  <li>Any claim regarding transit damage, missing items, or incorrect products must be reported within 24 hours of delivery with the unboxing video.</li>
                  <li>Claims submitted without a valid unboxing video may not be accepted.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#4a3391] mb-4">4. Replacement &amp; Warranty</h2>
                <ul className="list-disc pl-6 space-y-2 marker:text-[#4a3391]">
                  <li>No refunds will be provided.</li>
                  <li>Eligible cases will be resolved through replacement only, subject to verification.</li>
                  <li>Products covered under warranty will receive replacement service as per the manufacturer’s or seller’s warranty policy.</li>
                  <li>Physical damage, water damage, improper installation, misuse, or unauthorized repairs are not covered under warranty.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#4a3391] mb-4">5. Product Information</h2>
                <p>
                  We make every effort to ensure product descriptions, specifications, and images are accurate. However, minor variations in packaging, color, or design may occur.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#4a3391] mb-4">6. Pricing &amp; Orders</h2>
                <p>
                  Neokart reserves the right to modify prices, discontinue products, or cancel orders due to pricing errors, stock unavailability, suspected fraud, or other genuine reasons.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#4a3391] mb-4">7. Limitation of Liability</h2>
                <p>
                  Neokart shall not be liable for any indirect, incidental, or consequential loss arising from the use of our products or services, except as required under applicable Indian law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#4a3391] mb-4">8. Governing Law</h2>
                <p>
                  These Terms &amp; Conditions shall be governed by the laws of India. Any disputes arising from the use of our website or services shall be subject to the exclusive jurisdiction of the competent courts in Kozhikode (Calicut), Kerala.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#4a3391] mb-4">Contact Us</h2>
                <p className="mb-4 not-italic">
                  <span className="font-semibold text-slate-900">NEOKART</span><br />
                  A.M. Motors Building, Near Check Post<br />
                  Chungam, Thamarassery<br />
                  Calicut, Kerala – 673573
                </p>
                <p className="mb-2">
                  Phone:{" "}
                  <a href="tel:+916235251520" className="text-[#4a3391] hover:text-[#593dab] font-medium transition-colors">+91 62352 51520</a>,{" "}
                  <a href="tel:+916235251523" className="text-[#4a3391] hover:text-[#593dab] font-medium transition-colors">+91 62352 51523</a>,{" "}
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
