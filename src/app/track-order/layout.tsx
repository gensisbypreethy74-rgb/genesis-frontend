import type { Metadata } from "next";

export const metadata: Metadata = { title: "Track Your Order" };

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
