/**
 * Local brand marks for known providers (Simple Icons SVGs in /public/logos).
 * Keys are lowercase guide/toolkit slugs without spaces.
 */
const LOGO_BY_KEY: Record<string, string> = {
  github: "/logos/github.svg",
  gmail: "/logos/gmail.svg",
  slack: "/logos/slack.svg",
  notion: "/logos/notion.svg",
  googlecalendar: "/logos/googlecalendar.svg",
  "google-calendar": "/logos/googlecalendar.svg",
  linear: "/logos/linear.svg",
  hubspot: "/logos/hubspot.svg",
  salesforce: "/logos/salesforce.svg",
};

/** Resolve a public logo path from a guide slug, Composio slug, or display name. */
export function providerLogoSrc(
  key: string | null | undefined,
): string | null {
  if (!key) return null;
  const normalized = key.trim().toLowerCase().replace(/[\s_]+/g, "");
  return LOGO_BY_KEY[normalized] ?? null;
}
