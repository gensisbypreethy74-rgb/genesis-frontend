import type { Metadata } from "next";
import { fetchStory } from "../../lib/story";
import StoryClient from "./StoryClient";

// Re-rendered at most once a minute, so admin edits show up within that window.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "The house begun by a woman who spent nineteen years shaping how rooms make people feel — clothing designed in Kochi, for the life actually lived.",
};

export default async function StoryPage() {
  const payload = await fetchStory();
  return <StoryClient payload={payload} />;
}
