"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Guide } from "@/lib/guides/schema";
import { storeGenerationResult } from "@/lib/generate-storage";

/** Hardcoded investigation flavors — shown at random while the agent runs. */
const LOADING_STATES = [
  "Looking up the provider’s developer portal…",
  "Checking whether a managed OAuth app exists…",
  "Skimming OAuth authorization docs…",
  "Reading redirect URI and callback requirements…",
  "Estimating hands-on setup time…",
  "Checking typical review / verification wait…",
  "Sorting what an agent can do vs what you must do…",
  "Scanning for common gotchas…",
  "Cross-checking scopes and consent screen notes…",
  "Looking for marketplace or distribution steps…",
  "Comparing managed OAuth app vs custom OAuth app paths…",
  "Gathering official docs and secondary sources…",
  "Drafting the managed vs custom OAuth recommendation…",
  "Mapping path forks for different product goals…",
  "Writing unblock tips for stuck setups…",
  "Labeling source confidence (verified vs inferred)…",
  "Double-checking public policy pages…",
  "Packaging the readiness guide…",
  "Polishing steps into plain language…",
  "Almost there — assembling the final guide…",
] as const;

/**
 * Target progress % at the end of each phase (seconds from start).
 * Fast early, then progressively slower so a long wait still feels alive.
 */
const PROGRESS_PHASES = [
  { atSec: 60, pct: 70 },
  { atSec: 80, pct: 85 },
  { atSec: 90, pct: 93 },
  { atSec: 100, pct: 97 },
] as const;

/** Map elapsed seconds → progress 0–99 (never 100 until generation finishes). */
function progressForElapsed(elapsedSec: number): number {
  let prevAt = 0;
  let prevPct = 0;
  for (const phase of PROGRESS_PHASES) {
    if (elapsedSec <= phase.atSec) {
      const t = (elapsedSec - prevAt) / (phase.atSec - prevAt);
      return prevPct + (phase.pct - prevPct) * t;
    }
    prevAt = phase.atSec;
    prevPct = phase.pct;
  }
  // After 100s: crawl toward 99% without finishing.
  const extra = elapsedSec - 100;
  return Math.min(99, 97 + (1 - Math.exp(-extra / 40)) * 2);
}

function pickRandomState(exclude?: string): string {
  const pool = LOADING_STATES.filter((s) => s !== exclude);
  return pool[Math.floor(Math.random() * pool.length)] ?? LOADING_STATES[0];
}

/**
 * Submits app name/URL to the live investigation agent and stores
 * the result in sessionStorage for the results page (no DB).
 */
export function GenerateForm() {
  const router = useRouter();
  const [appQuery, setAppQuery] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_STATES[0]);
  const [barPct, setBarPct] = useState(0);
  const startRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  // Animate progress bar + rotate random status lines while loading.
  useEffect(() => {
    if (status !== "loading") return;

    doneRef.current = false;
    startRef.current = performance.now();
    setBarPct(0);
    setLoadingMessage(pickRandomState());

    const barId = window.setInterval(() => {
      if (doneRef.current || startRef.current == null) return;
      const elapsed = (performance.now() - startRef.current) / 1000;
      setBarPct(progressForElapsed(elapsed));
    }, 100);

    const msgId = window.setInterval(() => {
      if (doneRef.current) return;
      setLoadingMessage((prev) => pickRandomState(prev));
    }, 2800);

    return () => {
      window.clearInterval(barId);
      window.clearInterval(msgId);
    };
  }, [status]);

  /** Snap the bar to 100%, then navigate once the paint has settled. */
  async function finishAndNavigate(guide: Guide) {
    doneRef.current = true;
    setBarPct(100);
    setLoadingMessage("Guide ready — opening…");
    // Persist guide for the results page (no DB).
    storeGenerationResult(guide);
    await new Promise((r) => setTimeout(r, 350));
    router.push("/generate/result");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!appQuery.trim()) return;

    const query = appQuery.trim();
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appQuery: query,
          website: website.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = (await res.json()) as {
        guide?: Guide;
        error?: string;
      };

      if (!res.ok || !data.guide) {
        throw new Error(data.error || "Generation failed");
      }

      await finishAndNavigate(data.guide);
    } catch (err) {
      doneRef.current = true;
      setStatus("error");
      setBarPct(0);
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-2xl space-y-5 rounded-lg border border-border bg-card p-6"
    >
      <div className="space-y-2">
        <label
          htmlFor="app"
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
        >
          App name
        </label>
        <Input
          id="app"
          placeholder="e.g. HubSpot, Asana, Linear"
          value={appQuery}
          onChange={(e) => setAppQuery(e.target.value)}
          required
          disabled={status === "loading"}
          className="h-10 border-border bg-background focus-visible:border-brand focus-visible:ring-brand/30"
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="website"
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
        >
          Website (optional)
        </label>
        <Input
          id="website"
          placeholder="https://…"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          disabled={status === "loading"}
          className="h-10 border-border bg-background focus-visible:border-brand focus-visible:ring-brand/30"
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="notes"
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
        >
          Context (optional)
        </label>
        <Textarea
          id="notes"
          placeholder="e.g. I want real users to see my app name, need send-email access…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={status === "loading"}
          rows={3}
          className="border-border bg-background focus-visible:border-brand focus-visible:ring-brand/30"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={status === "loading" || !appQuery.trim()}
      >
        {status === "loading" ? "Generating…" : "Generate guide"}
      </Button>

      {status === "loading" ? (
        <div className="space-y-3" aria-live="polite" aria-busy="true">
          <div className="h-1.5 w-full overflow-hidden border border-border bg-overlay">
            <div
              className="h-full bg-brand transition-[width] duration-150 ease-linear"
              style={{ width: `${barPct}%` }}
            />
          </div>
          <p className="font-mono text-sm text-muted-foreground">
            <span className="text-brand">›</span> {loadingMessage}
          </p>
          <p className="font-mono text-xs tabular-nums text-muted-foreground/70">
            {Math.round(barPct)}%
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="text-base leading-6 text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
