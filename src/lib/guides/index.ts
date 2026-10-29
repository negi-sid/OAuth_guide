import { gmailGuide } from "./data/gmail";
import { githubGuide } from "./data/github";
import { notionGuide } from "./data/notion";
import { slackGuide } from "./data/slack";
import type { Guide } from "./schema";

/** Curated library — order reflects Easy → Hard (D4). */
export const curatedGuides: Guide[] = [
  githubGuide,
  notionGuide,
  slackGuide,
  gmailGuide,
];

const bySlug = new Map(curatedGuides.map((g) => [g.slug, g]));

/** Look up a curated guide by slug, or undefined. */
export function getGuide(slug: string): Guide | undefined {
  return bySlug.get(slug);
}

export function listGuides(): Guide[] {
  return curatedGuides;
}
