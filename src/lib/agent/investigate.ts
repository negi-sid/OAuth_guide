import {
  generateText,
  Output,
  stepCountIs,
  tool,
} from "ai";
import { z } from "zod";
import {
  COMPOSIO_OAUTH_CALLBACK,
  guideSchema,
  type Guide,
} from "@/lib/guides/schema";
import {
  getOpenRouterModel,
  getOpenRouterResearchModel,
  getOpenRouterWebSearchTool,
} from "./openrouter";

const MANAGED_AUTH_URL = "https://docs.composio.dev/toolkits/managed-auth";

/** Fetch a public URL and return truncated text for the agent. */
async function fetchUrlText(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "OAuthReadinessBot/1.0 (research; take-home)" },
      redirect: "follow",
    });
    if (!res.ok) {
      return `HTTP ${res.status} for ${url}`;
    }
    const contentType = res.headers.get("content-type") || "";
    const raw = await res.text();
    // Prefer readable text; strip crude tags for HTML.
    const text = contentType.includes("html")
      ? raw
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      : raw;
    return text.slice(0, 14000);
  } catch (err) {
    return `Failed to fetch ${url}: ${err instanceof Error ? err.message : "error"}`;
  } finally {
    clearTimeout(timer);
  }
}

export type InvestigateInput = {
  appQuery: string;
  website?: string;
  notes?: string;
};

const SYSTEM_GUIDE_WRITER = `You write plain-language OAuth setup guides for people building AI agents (often with Composio). Audience includes newer, AI-native builders — not only senior engineers. Prefer short sentences. Always use Composio product lingo: "managed OAuth app" (Composio-hosted credentials) and "custom OAuth app" (developer-registered credentials wired into a Composio auth config). Do not say "Composio's app", "ready-made login", or bare "BYO".

Fill the guide schema so a reader knows:
1) managedVsByo: when to stay on Composio's managed OAuth app vs create a custom OAuth app (decision only — do not rehash this later)
2) Overview effort: activeEffortAtAGlance / calendarWaitAtAGlance + crisp supporting lines (fallback summary across paths)
3) recommendedPathIndex: 0-based index of the usual-best path
4) pathForks: 2–3 variants of *custom OAuth app* setup only (never "use managed" as a fork). EACH fork must include:
   - effortAtAGlance / calendarWaitAtAGlance (clear time units)
   - activeEffort / calendarWait (one crisp line each)
   - requirements, gotchas, steps, blockers specific to that path (arrays may be empty)
5) Guide-level requirements / gotchas / steps / blockers are the SHARED base (callback URL, Composio “use your own credentials” wiring). Path lists are merged on top — put Composio wiring in guide-level steps.
6) What an AI helper can do vs what a human must do
7) Sources with confidence verified | inferred | unknown

Writing style:
- Prefer "managed OAuth app" / "custom OAuth app"; explain once that custom means registering with the provider and pasting Client ID/secret into Composio.
- Do not start path steps with "decide managed vs custom."
- Never invent guaranteed approval SLAs; cite published ranges with caveats.
- Do not claim you created real apps or finished provider review.
- Thin evidence → unknown/inferred and say what to check.
- Prefer official provider + Composio docs; blogs = inferred.
- Always include Composio callback when discussing custom OAuth redirect setup: ${COMPOSIO_OAUTH_CALLBACK}
- slug: lowercase kebab-case; generated: true; lastReviewed: null
- composioManagedAvailable: true/false/null from evidence
- website: MUST be the deep link where a developer creates/registers the custom OAuth app (developer console / credentials / apps portal). Examples: Google → console.cloud.google.com/apis/credentials; Slack → api.slack.com/apps; GitHub → github.com/settings/developers; Notion → notion.so/my-integrations. NEVER the consumer product homepage (gmail.com, slack.com, notion.so marketing site, etc.). If the user pasted a marketing URL, replace it with the OAuth console URL from research.

Composio context: many popular toolkits have a managed OAuth app for prototypes; a custom OAuth app is often needed for production branding, custom permissions, usage limits, or when no managed OAuth app exists.`;

/** True if a tool call name is OpenRouter's web search server tool. */
function isWebSearchToolName(name: string): boolean {
  return (
    name === "web_search" ||
    name === "openrouter.web_search" ||
    name.includes("web_search")
  );
}

/** Append a research step and mirror it to the server console. */
function logStep(steps: string[], message: string) {
  steps.push(message);
  console.log(`[investigate] ${message}`);
}

/**
 * Summarize AI SDK research steps: web-search counts + every tool name seen.
 * Local tools (fetch_url) already push their own lines via execute().
 */
function recordModelToolActivity(
  steps: string[],
  researchSteps: Array<{
    toolCalls?: Array<{ toolName: string; input?: unknown }>;
  }>,
): void {
  let searchCount = 0;
  const otherTools: string[] = [];

  for (const [i, step] of researchSteps.entries()) {
    for (const call of step.toolCalls ?? []) {
      if (isWebSearchToolName(call.toolName)) {
        searchCount += 1;
        const inputPreview =
          call.input && typeof call.input === "object"
            ? JSON.stringify(call.input).slice(0, 160)
            : "";
        logStep(
          steps,
          `web_search #${searchCount} (model step ${i + 1})${inputPreview ? `: ${inputPreview}` : ""}`,
        );
      } else if (
        call.toolName !== "fetch_url" &&
        call.toolName !== "check_composio_managed_hint"
      ) {
        otherTools.push(call.toolName);
      }
    }
  }

  if (searchCount > 0) {
    logStep(
      steps,
      `OpenRouter web_search tool used (${searchCount} ${searchCount === 1 ? "query" : "queries"})`,
    );
  } else {
    logStep(
      steps,
      "No extra web_search tool calls (plugin grounding may still have run)",
    );
  }

  if (otherTools.length > 0) {
    logStep(steps, `Other model tools: ${[...new Set(otherTools)].join(", ")}`);
  }
}

/**
 * Investigate an app's OAuth setup path and return a D3-shaped guide.
 *
 * Two phases on purpose: OpenRouter + AI SDK break when Output.object
 * (json_schema response_format) is combined with tools in the same loop —
 * the model never emits real tool_calls and finishReason stays "tool-calls",
 * which surfaces as AI_NoOutputGeneratedError ("No output generated.").
 */
export async function investigateApp(
  input: InvestigateInput,
): Promise<{ guide: Guide; steps: string[] }> {
  const steps: string[] = [];
  // Research model has OpenRouter web plugin (always searches once).
  // Structured phase uses a plain model (no search cost / no tool conflict).
  const researchModel = getOpenRouterResearchModel();
  const writerModel = getOpenRouterModel();

  logStep(
    steps,
    `Starting research for "${input.appQuery}" (OpenRouter web plugin ON)`,
  );

  // --- Phase 1: research with web search + fetch tools (plain text, no Output.object) ---
  const research = await generateText({
    model: researchModel,
    // Extra headroom: web search + fetches + brief each consume steps.
    stopWhen: stepCountIs(12),
    tools: {
      // Extra mid-loop searches after the plugin's initial grounding.
      web_search: getOpenRouterWebSearchTool(),
      fetch_url: tool({
        description:
          "Fetch a public documentation or marketing URL and return full page text for deeper analysis after web search finds candidate URLs.",
        inputSchema: z.object({
          url: z.string().url(),
          reason: z.string().describe("Why this URL is being fetched"),
        }),
        execute: async ({ url, reason }) => {
          logStep(steps, `Fetched: ${url} (${reason})`);
          return { url, reason, content: await fetchUrlText(url) };
        },
      }),
      check_composio_managed_hint: tool({
        description:
          "Fetch Composio's managed OAuth apps directory page to see if the toolkit is likely managed.",
        inputSchema: z.object({
          toolkitName: z.string(),
        }),
        execute: async ({ toolkitName }) => {
          logStep(
            steps,
            `Checked Composio managed directory for ${toolkitName}`,
          );
          const content = await fetchUrlText(MANAGED_AUTH_URL);
          const upper = toolkitName.toUpperCase();
          const mentioned =
            content.toUpperCase().includes(toolkitName.toUpperCase()) ||
            content.includes(upper);
          return {
            managedAuthDoc: MANAGED_AUTH_URL,
            toolkitName,
            nameAppearsOnPage: mentioned,
            note: "Appearance on the page is a hint only — confirm via Composio API/docs. Page lists managed OAuth apps and custom OAuth app tables.",
            excerpt: content.slice(0, 4000),
          };
        },
      }),
    },
    system: `You are an OAuth research assistant with live web search.

OpenRouter already injects live web results for this request. Use them first.
Workflow:
1) Read the injected web results; call web_search again for gaps (app review waits, redirect URI quirks, community friction).
2) Use fetch_url on the best official URLs to read fuller page text.
3) Use check_composio_managed_hint for Composio managed OAuth availability.
4) Prefer official provider + Composio docs over blogs; treat community posts as inferred.

After researching, write a dense plain-text research brief covering:
- The exact OAuth / developer console URL where you create the custom OAuth app (not the consumer homepage)
- Official OAuth docs / app review URLs (cite what you found)
- Whether a Composio managed OAuth app seems available (and evidence)
- Custom OAuth app registration steps and typical review/wait times
- Requirements, gotchas, human-only steps
- Source URLs with confidence (verified / inferred / unknown)

Do not invent approval SLAs. Prefer official docs.`,
    prompt: `Research how to set up OAuth for:

App: ${input.appQuery}
Website hint: ${input.website || "(not provided — find the official developer/OAuth console, not the consumer product site)"}
Extra context: ${input.notes || "none"}

1) Use live web results / web_search for official OAuth / developer portal / app review docs and recent setup friction.
2) Identify the console URL where a developer registers the OAuth app / credentials (credentials page, apps portal, integrations page).
3) fetch_url the strongest official pages.
4) Check Composio managed OAuth app directory hints if relevant.
5) Return a research brief only (not a JSON guide). Explicitly include a line: OAuth console URL: <url>`,
  });

  logStep(
    steps,
    `Research phase done (${research.steps.length} model steps, brief ${research.text.trim().length} chars)`,
  );
  recordModelToolActivity(steps, research.steps);

  const researchNotes =
    research.text.trim() ||
    "(Model returned empty research text — write the guide from general public knowledge and mark confidence as unknown/inferred.)";

  logStep(steps, "Writing structured guide from research brief…");

  // --- Phase 2: structured guide from research notes (no tools / no web plugin) ---
  const result = await generateText({
    model: writerModel,
    output: Output.object({
      schema: guideSchema,
    }),
    system: SYSTEM_GUIDE_WRITER,
    prompt: `Using the research brief below, return a complete guide object using managed OAuth app / custom OAuth app terminology.

App: ${input.appQuery}
Website hint from user: ${input.website || "(none — use OAuth console URL from research brief)"}
Extra context: ${input.notes || "none"}

Set guide.website to the OAuth / developer console deep link from the research brief (where you create the app/credentials). Do not use a consumer homepage.

--- Research brief ---
${researchNotes}
--- End research brief ---`,
  });

  // Accessing result.output throws NoOutputGeneratedError when null — catch clearly.
  let output: Guide;
  try {
    output = result.output;
  } catch {
    throw new Error(
      "Model did not return a structured guide. Try again, or set OPENROUTER_MODEL to a model that supports structured outputs.",
    );
  }

  const guide = {
    ...output,
    generated: true,
    lastReviewed: null,
  } satisfies Guide;

  logStep(
    steps,
    `Guide ready: ${guide.name} (${guide.slug}) · ${guide.sources.length} sources · ${guide.pathForks.length} paths`,
  );

  return { guide, steps };
}
