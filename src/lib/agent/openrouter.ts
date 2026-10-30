import { createOpenRouter } from "@openrouter/ai-sdk-provider";

/**
 * OpenRouter client for live guide generation.
 * Reads OPENROUTER_API_KEY from the environment (never commit secrets).
 */
export function getOpenRouter() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to .env.local (see .env.example).",
    );
  }

  return createOpenRouter({
    apiKey,
    // Optional attribution headers for OpenRouter rankings
    headers: {
      "HTTP-Referer":
        process.env.OPENROUTER_HTTP_REFERER || "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_APP_TITLE || "OAuth Readiness",
    },
  });
}

function resolveModelId() {
  return process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
}

/** Engines accepted by the web *plugin* (no "auto"). */
type WebPluginEngine = "native" | "exa" | "firecrawl" | "parallel" | "perplexity";

function resolveWebSearchMaxResults() {
  const maxResults = Number(process.env.OPENROUTER_WEB_SEARCH_MAX_RESULTS || 5);
  return Number.isFinite(maxResults) ? maxResults : 5;
}

/**
 * Plugin engine: omit when unset/"auto" so OpenRouter picks native-or-Exa.
 * Explicit values are passed through.
 */
function resolveWebPluginEngine(): WebPluginEngine | undefined {
  const engine = process.env.OPENROUTER_WEB_SEARCH_ENGINE;
  if (!engine || engine === "auto") return undefined;
  if (
    engine === "native" ||
    engine === "exa" ||
    engine === "firecrawl" ||
    engine === "parallel" ||
    engine === "perplexity"
  ) {
    return engine;
  }
  return undefined;
}

/** Server-tool engine may be "auto". */
function resolveWebSearchToolEngine(): "auto" | "native" | "exa" {
  const engine = process.env.OPENROUTER_WEB_SEARCH_ENGINE || "auto";
  if (engine === "native" || engine === "exa" || engine === "auto") return engine;
  return "auto";
}

/** Default chat model — cheap + tool-capable; override with OPENROUTER_MODEL. */
export function getOpenRouterModel() {
  const openrouter = getOpenRouter();
  return openrouter(resolveModelId());
}

/**
 * Research-phase model with OpenRouter's web plugin enabled.
 * Always grounds the first turn with live search results (billed by OpenRouter).
 * @see https://openrouter.ai/docs/guides/features/plugins/web-search
 */
export function getOpenRouterResearchModel() {
  const openrouter = getOpenRouter();
  const engine = resolveWebPluginEngine();
  return openrouter(resolveModelId(), {
    plugins: [
      {
        id: "web",
        ...(engine ? { engine } : {}),
        max_results: resolveWebSearchMaxResults(),
        search_prompt:
          "Live web results for OAuth / developer setup research (prefer official docs). Cite sources with markdown links.",
      },
    ],
  });
}

/**
 * OpenRouter server-side web search tool (Exa / native / etc.).
 * Lets the model run extra searches mid-loop after the plugin's initial grounding.
 * @see https://openrouter.ai/docs/guides/features/server-tools/web-search
 */
export function getOpenRouterWebSearchTool() {
  const openrouter = getOpenRouter();
  return openrouter.tools.webSearch({
    maxResults: resolveWebSearchMaxResults(),
    engine: resolveWebSearchToolEngine(),
  });
}
