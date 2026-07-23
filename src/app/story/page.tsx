import type { Metadata } from "next";
import { fetchStory } from "../../lib/story";
import StoryClient from "./StoryClient";

// Always reflect the latest admin edits — no build-time caching of the feed.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const payload = await fetchStory({ noStore: true });
  const s = payload?.settings;
  return {
    title: s?.metaTitle || "Story · Genesis by Preethy",
    description:
      s?.metaDescription ||
      "The house begun by a woman who spent nineteen years shaping how rooms make people feel — clothing designed in Kochi, for the life actually lived.",
  };
}

export default async function StoryPage() {
  const payload = await fetchStory({ noStore: true });
  return <StoryClient payload={payload} />;
}
