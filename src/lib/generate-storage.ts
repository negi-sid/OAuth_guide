import type { Guide } from "@/lib/guides/schema";

/** sessionStorage key for the last live-generated guide. */
export const LAST_GUIDE_KEY = "oauth-readiness:last-guide";

/** sessionStorage key for research/tool activity from the last generation. */
export const LAST_RESEARCH_LOG_KEY = "oauth-readiness:last-research-log";

export type ResearchLog = {
  appQuery: string;
  createdAt: string;
  steps: string[];
};

/** Persist guide + research steps for the results page. */
export function storeGenerationResult(
  guide: Guide,
  steps: string[],
  appQuery: string,
) {
  sessionStorage.setItem(LAST_GUIDE_KEY, JSON.stringify(guide));
  const log: ResearchLog = {
    appQuery,
    createdAt: new Date().toISOString(),
    steps,
  };
  sessionStorage.setItem(LAST_RESEARCH_LOG_KEY, JSON.stringify(log));
}

/** Read the last research log, or null if missing/corrupt. */
export function readResearchLog(): ResearchLog | null {
  try {
    const raw = sessionStorage.getItem(LAST_RESEARCH_LOG_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ResearchLog;
  } catch {
    return null;
  }
}
