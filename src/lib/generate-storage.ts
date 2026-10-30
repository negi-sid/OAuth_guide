import type { Guide } from "@/lib/guides/schema";

/** sessionStorage key for the last live-generated guide. */
export const LAST_GUIDE_KEY = "oauth-readiness:last-guide";

/** Persist guide for the results page (no DB). */
export function storeGenerationResult(guide: Guide) {
  sessionStorage.setItem(LAST_GUIDE_KEY, JSON.stringify(guide));
}
