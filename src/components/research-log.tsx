"use client";

import type { ResearchLog } from "@/lib/generate-storage";

/**
 * Shows the research / tool activity from the last live generation
 * so you can confirm OpenRouter web search without leaving the UI.
 */
export function ResearchLogPanel({ log }: { log: ResearchLog }) {
  const hasFetch = log.steps.some((s) => s.startsWith("Fetched:"));
  const hasWebSearchTool = log.steps.some((s) =>
    s.includes("web_search tool used"),
  );
  const pluginOn = log.steps.some((s) => s.includes("web plugin ON"));

  return (
    <details
      open
      className="mt-6 rounded-lg border border-border bg-card open:pb-4"
    >
      <summary className="cursor-pointer list-none px-4 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground [&::-webkit-details-marker]:hidden">
        Research log — confirm live search
        <span className="ml-2 normal-case tracking-normal text-muted-foreground/70">
          ({log.steps.length} events)
        </span>
      </summary>

      <div className="space-y-4 border-t border-border px-4 pt-4">
        <div className="flex flex-wrap gap-2 font-mono text-xs">
          <StatusPill ok={pluginOn} label="Web plugin" />
          <StatusPill ok={hasWebSearchTool} label="Extra web_search" />
          <StatusPill ok={hasFetch} label="Page fetches" />
        </div>

        <p className="text-sm leading-6 text-muted-foreground">
          For <span className="text-foreground">{log.appQuery}</span> at{" "}
          {new Date(log.createdAt).toLocaleString()}. Green pills mean that
          step ran. The web plugin grounds research even if extra{" "}
          <code className="font-mono text-xs">web_search</code> calls are zero.
        </p>

        <ol className="max-h-64 space-y-2 overflow-y-auto font-mono text-xs leading-5 text-muted-foreground">
          {log.steps.map((step, i) => (
            <li key={`${i}-${step.slice(0, 40)}`} className="flex gap-2">
              <span className="shrink-0 tabular-nums text-brand">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="break-all text-foreground/90">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </details>
  );
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={
        ok
          ? "rounded border border-brand/40 bg-brand/10 px-2 py-1 text-brand"
          : "rounded border border-border bg-overlay px-2 py-1 text-muted-foreground"
      }
    >
      {ok ? "✓" : "·"} {label}
    </span>
  );
}
