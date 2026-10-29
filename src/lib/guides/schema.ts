import { z } from "zod";

/** Confidence label for evidence honesty (D6). */
export const confidenceSchema = z.enum(["verified", "inferred", "unknown"]);

const blockerSchema = z.object({
  blocker: z.string(),
  unblock: z.string(),
});

/**
 * One selectable custom-OAuth path. Path-scoped lists merge with the guide’s
 * shared base (requirements/gotchas/steps/blockers at the guide root).
 */
export const pathForkSchema = z.object({
  name: z.string(),
  description: z.string(),
  /** Clear hands-on time for this path, e.g. "~30 min". */
  effortAtAGlance: z.string(),
  /** Clear review wait for this path, e.g. "Usually none". */
  calendarWaitAtAGlance: z.string(),
  activeEffort: z.string().describe("One crisp line under hands-on time"),
  calendarWait: z.string().describe("One crisp line under review wait"),
  requirements: z.array(z.string()),
  gotchas: z.array(z.string()),
  steps: z.array(z.string()),
  blockers: z.array(blockerSchema),
});

export const guideSchema = z.object({
  slug: z.string().describe("URL-safe id, e.g. github"),
  name: z.string(),
  // Must be the provider developer/OAuth console URL, not the consumer product homepage.
  website: z
    .string()
    .describe(
      "Deep link to where a developer creates/registers the custom OAuth app (e.g. Google Cloud credentials, Slack api.slack.com/apps). Never the consumer homepage like gmail.com or slack.com.",
    ),
  composioSlug: z.string().nullable().describe("Composio toolkit slug if known"),
  summary: z.string().describe("One short paragraph for the developer"),

  managedVsByo: z.object({
    composioManagedAvailable: z.boolean().nullable(),
    recommendation: z.string(),
    whenToStayManaged: z.array(z.string()),
    whenToStartByo: z.array(z.string()),
  }),

  difficulty: z.enum(["easy", "medium", "hard"]),
  /** Fallback glance labels when no path is selected (overview). */
  activeEffortAtAGlance: z
    .string()
    .describe("Short hands-on time, e.g. 20–45 min"),
  calendarWaitAtAGlance: z
    .string()
    .describe("Short review wait, e.g. Usually none or 2–10 days"),
  activeEffort: z
    .string()
    .describe("One crisp line under the hands-on time"),
  calendarWait: z
    .string()
    .describe("One crisp line under the review wait"),

  /** Default selected path (0-based). */
  recommendedPathIndex: z.number().int().nonnegative(),

  pathForks: z.array(pathForkSchema).min(1),

  /** Shared base — always shown; path-specific items are appended. */
  requirements: z.array(z.string()),
  gotchas: z.array(z.string()),
  /** Shared Composio wiring steps — appended after path-specific steps. */
  steps: z.array(z.string()),
  blockers: z.array(blockerSchema),

  agentCanDo: z.array(z.string()),
  humanMustDo: z.array(z.string()),

  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      confidence: confidenceSchema,
    }),
  ),

  lastReviewed: z.string().nullable().describe("ISO date for curated guides"),
  // Required (no .default) so OpenAI structured outputs include it in `required`
  generated: z.boolean(),
});

export type Guide = z.infer<typeof guideSchema>;
export type PathFork = z.infer<typeof pathForkSchema>;
export type Confidence = z.infer<typeof confidenceSchema>;

/** Composio OAuth callback developers register at the provider. */
export const COMPOSIO_OAUTH_CALLBACK =
  "https://backend.composio.dev/api/v3/toolkits/auth/callback";

const MANAGED_AUTH_DIRECTORY =
  "https://docs.composio.dev/toolkits/managed-auth";

/**
 * Docs URL for a toolkit page (e.g. github → /toolkits/github).
 * Falls back to the managed OAuth directory when slug is unknown.
 */
export function composioToolkitDocsUrl(
  slug: string | null | undefined,
): string {
  if (!slug) return MANAGED_AUTH_DIRECTORY;
  const normalized = slug
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "");
  if (!normalized) return MANAGED_AUTH_DIRECTORY;
  return `https://docs.composio.dev/toolkits/${normalized}`;
}

/** Content shown for a selected path: path overrides + shared base merged. */
export type ResolvedPathContent = {
  pathIndex: number;
  path: PathFork;
  activeEffortAtAGlance: string;
  calendarWaitAtAGlance: string;
  activeEffort: string;
  calendarWait: string;
  requirements: string[];
  gotchas: string[];
  steps: string[];
  blockers: Guide["blockers"];
};

/** Merge shared guide fields with the selected path’s overrides. */
export function resolvePathContent(
  guide: Guide,
  pathIndex: number,
): ResolvedPathContent {
  const safeIndex = Math.min(
    Math.max(pathIndex, 0),
    guide.pathForks.length - 1,
  );
  const path = guide.pathForks[safeIndex]!;

  return {
    pathIndex: safeIndex,
    path,
    activeEffortAtAGlance: path.effortAtAGlance,
    calendarWaitAtAGlance: path.calendarWaitAtAGlance,
    activeEffort: path.activeEffort,
    calendarWait: path.calendarWait,
    requirements: [...guide.requirements, ...path.requirements],
    gotchas: [...guide.gotchas, ...path.gotchas],
    // Path-specific setup first, then shared Composio wiring.
    steps: [...path.steps, ...guide.steps],
    blockers: [...guide.blockers, ...path.blockers],
  };
}
