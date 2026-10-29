"use client";

import { useEffect, useMemo, useState } from "react";
import type { Guide, PathFork } from "@/lib/guides/schema";
import {
  composioToolkitDocsUrl,
  resolvePathContent,
} from "@/lib/guides/schema";
import { guideToMarkdown } from "@/lib/guides/to-markdown";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProviderLogo } from "@/components/provider-logo";
import { Check, Clock3, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";

function MonoChip({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "brand" | "danger";
}) {
  const toneClass =
    tone === "brand"
      ? "border-brand/40 text-brand"
      : tone === "danger"
        ? "border-destructive/40 text-destructive"
        : "border-border text-muted-foreground";
  return (
    <span
      className={`rounded-sm border px-1.5 py-0.5 font-mono text-sm uppercase tracking-wider ${toneClass}`}
    >
      {children}
    </span>
  );
}

function List({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "space-y-2 text-base leading-6 text-muted-foreground",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground/40" />
          <span className="text-foreground/85">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Decision-tree view of custom OAuth app path forks.
 * Clicking a path drives the checklist / requirements below.
 */
function PathForkTree({
  providerName,
  forks,
  selectedIndex,
  onSelect,
}: {
  providerName: string;
  forks: PathFork[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const cols = Math.min(Math.max(forks.length, 1), 4);

  return (
    <div className="w-full">
      <div className="flex justify-center">
        <div className="border border-border bg-card px-4 py-2.5 text-center">
          <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
            Start
          </p>
          <p className="mt-1 text-base tracking-tight text-foreground">
            Custom OAuth app · {providerName}
          </p>
        </div>
      </div>

      {/* Trunk stays brand when a path is selected (always one is). */}
      <div className="mx-auto h-8 w-px bg-brand" aria-hidden />

      <div className="hidden sm:block">
        <div
          className="relative grid"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          <span
            className="absolute top-0 h-px bg-border"
            style={{
              left: `${100 / (cols * 2)}%`,
              right: `${100 / (cols * 2)}%`,
            }}
            aria-hidden
          />
          {/* Brand segment of the rail from tree center to the selected branch */}
          {cols > 1 ? (
            <span
              className="absolute top-0 h-px bg-brand transition-all duration-200"
              style={(() => {
                const first = 100 / (cols * 2);
                const step = 100 / cols;
                const selectedCenter = first + selectedIndex * step;
                const rootCenter = 50;
                const left = Math.min(rootCenter, selectedCenter);
                const right = 100 - Math.max(rootCenter, selectedCenter);
                return { left: `${left}%`, right: `${right}%` };
              })()}
              aria-hidden
            />
          ) : null}
          {forks.map((fork, i) => {
            const selected = selectedIndex === i;
            return (
              <div
                key={`branch-${fork.name}`}
                className="relative flex h-12 flex-col items-center"
              >
                <span
                  className={cn(
                    "h-full w-px transition-colors duration-200",
                    selected ? "bg-brand" : "bg-border",
                  )}
                  aria-hidden
                />
                <span
                  className={cn(
                    "absolute top-1/2 z-10 -translate-y-1/2 bg-background px-1.5 font-mono text-xs uppercase tracking-wider transition-colors duration-200",
                    selected ? "text-brand" : "text-muted-foreground",
                  )}
                >
                  Path {i + 1}
                </span>
              </div>
            );
          })}
        </div>

        <div
          className="mt-0 grid gap-4"
          role="radiogroup"
          aria-label="Custom OAuth setup path"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {forks.map((fork, i) => (
            <PathForkNode
              key={fork.name}
              fork={fork}
              pathIndex={i + 1}
              selected={selectedIndex === i}
              onSelect={() => onSelect(i)}
            />
          ))}
        </div>
      </div>

      <div className="sm:hidden">
        <ul
          className="space-y-0 border-l border-border pl-5"
          role="radiogroup"
          aria-label="Custom OAuth setup path"
        >
          {forks.map((fork, i) => {
            const selected = selectedIndex === i;
            return (
              <li key={fork.name} className="relative pb-5 last:pb-0">
                <span
                  className={cn(
                    "absolute -left-[1.3rem] top-4 size-2.5 border bg-card transition-colors duration-200",
                    selected ? "border-brand bg-brand" : "border-border",
                  )}
                  aria-hidden
                />
                <p
                  className={cn(
                    "mb-1 font-mono text-xs uppercase tracking-wider",
                    selected ? "text-brand" : "text-muted-foreground",
                  )}
                >
                  Path {i + 1}
                </p>
                <PathForkNode
                  fork={fork}
                  pathIndex={i + 1}
                  selected={selected}
                  onSelect={() => onSelect(i)}
                  hideMobilePathLabel
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** Selectable leaf in the custom-OAuth path tree. */
function PathForkNode({
  fork,
  pathIndex,
  selected,
  onSelect,
  hideMobilePathLabel = false,
}: {
  fork: PathFork;
  pathIndex: number;
  selected: boolean;
  onSelect: () => void;
  hideMobilePathLabel?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex h-full w-full flex-col border bg-card p-4 text-left transition-colors",
        selected
          ? "border-brand shadow-[inset_0_0_0_1px_rgba(81,162,255,0.25)]"
          : "border-border hover:border-white/20",
      )}
    >
      {!hideMobilePathLabel ? (
        <p
          className={cn(
            "font-mono text-xs uppercase tracking-wider sm:hidden",
            selected ? "text-brand" : "text-muted-foreground",
          )}
        >
          Path {pathIndex}
        </p>
      ) : null}
      <h3 className="text-base tracking-tight text-foreground">{fork.name}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-5 text-muted-foreground">
        {fork.description}
      </p>

      {/* Review time above hands-on — stacked */}
      <div className="mt-3 space-y-2 border-t border-border pt-3">
        <div className="flex items-start gap-2">
          <Hourglass
            className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Review time
            </p>
            <p className="font-mono text-sm text-foreground">
              {fork.calendarWaitAtAGlance}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Clock3
            className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Hands-on time
            </p>
            <p className="font-mono text-sm text-foreground">
              {fork.effortAtAGlance}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

/**
 * Interactive to-do checklist for custom OAuth setup steps.
 * Progress is remembered per guide slug + selected path.
 */
function StepsChecklist({
  slug,
  pathIndex,
  steps,
}: {
  slug: string;
  pathIndex: number;
  steps: string[];
}) {
  const storageKey = `oauth-readiness:checklist:${slug}:path-${pathIndex}`;
  const [done, setDone] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setDone(JSON.parse(raw) as Record<number, boolean>);
      else setDone({});
    } catch {
      setDone({});
    }
  }, [storageKey]);

  function toggle(index: number) {
    setDone((prev) => {
      const next = { ...prev, [index]: !prev[index] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Ignore write failures.
      }
      return next;
    });
  }

  const completed = steps.reduce((n, _, i) => n + (done[i] ? 1 : 0), 0);

  return (
    <div className="space-y-3">
      <p className="font-mono text-sm text-muted-foreground">
        {completed}/{steps.length} complete
      </p>
      <ul className="space-y-2">
        {steps.map((step, i) => {
          const checked = Boolean(done[i]);
          const id = `${slug}-p${pathIndex}-step-${i}`;
          return (
            <li key={id}>
              <label
                htmlFor={id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 border border-border bg-card p-3 transition-colors hover:border-white/20",
                  checked && "border-white/15 bg-overlay/60",
                )}
              >
                <span className="relative mt-0.5 shrink-0">
                  <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(i)}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center border border-brand bg-background peer-focus-visible:ring-2 peer-focus-visible:ring-brand",
                      checked && "border-brand bg-brand",
                    )}
                    aria-hidden
                  >
                    {checked ? (
                      <Check
                        className="size-3.5 text-brand-on-brand"
                        strokeWidth={3}
                      />
                    ) : null}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block text-base leading-6 text-foreground/85",
                      checked &&
                        "text-muted-foreground line-through decoration-brand",
                    )}
                  >
                    {step}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Full D3 guide view — same shell width as Toolkits/OAuth (max-w-7xl),
 * body ~16/24, H1 ~30px to match docs.composio.dev/toolkits.
 * Selecting a path swaps effort cards + checklist content below.
 */
export function GuideView({ guide }: { guide: Guide }) {
  const [copied, setCopied] = useState(false);
  const pathStorageKey = `oauth-readiness:path:${guide.slug}`;
  const [pathIndex, setPathIndex] = useState(guide.recommendedPathIndex);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(pathStorageKey);
      if (raw != null) {
        const parsed = Number.parseInt(raw, 10);
        if (
          Number.isFinite(parsed) &&
          parsed >= 0 &&
          parsed < guide.pathForks.length
        ) {
          setPathIndex(parsed);
          return;
        }
      }
    } catch {
      // Ignore.
    }
    setPathIndex(guide.recommendedPathIndex);
  }, [guide.pathForks.length, guide.recommendedPathIndex, pathStorageKey]);

  function selectPath(index: number) {
    setPathIndex(index);
    try {
      localStorage.setItem(pathStorageKey, String(index));
    } catch {
      // Ignore.
    }
  }

  const resolved = useMemo(
    () => resolvePathContent(guide, pathIndex),
    [guide, pathIndex],
  );

  async function copyMarkdown() {
    await navigator.clipboard.writeText(
      guideToMarkdown(guide, resolved.pathIndex),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <article className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <ProviderLogo
            name={guide.composioSlug ?? guide.slug}
            size={28}
          />
          <h1 className="text-[1.875rem] leading-9 tracking-tight sm:text-[2rem] sm:leading-10">
            {guide.name}
          </h1>
        </div>
        <p className="max-w-4xl text-base leading-6 text-muted-foreground">
          {guide.summary}
        </p>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={copyMarkdown}>
            {copied ? "Copied" : "Copy Markdown"}
          </Button>
          <a
            href={guide.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center rounded-lg border border-white/15 px-3 text-sm transition-colors hover:bg-overlay"
          >
            View Website
          </a>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="text-xl tracking-tight">
          Managed OAuth app, or custom OAuth app?
        </h2>
        <p className="text-base leading-7 text-muted-foreground">
          Composio provides a{" "}
          <a
            href="https://docs.composio.dev/toolkits/managed-auth"
            target="_blank"
            rel="noreferrer"
            className="text-brand-ink underline-offset-4 hover:underline"
          >
            managed OAuth app
          </a>{" "}
          for many toolkits — the simplest way to connect users without
          registering credentials at the provider yourself.
        </p>
        <p className="text-base leading-7 text-foreground/85">
          You may want a custom OAuth app when you need your brand on the
          consent screen, permissions beyond Composio’s defaults, your own
          usage limits, or when no managed OAuth app is available for this
          toolkit.
        </p>
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-3">
            <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
              Stay on the managed OAuth app when
            </h3>
            <List
              items={guide.managedVsByo.whenToStayManaged}
              className="space-y-3 leading-7"
            />
          </div>
          <div className="space-y-3">
            <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
              Use a custom OAuth app when
            </h3>
            <List
              items={guide.managedVsByo.whenToStartByo}
              className="space-y-3 leading-7"
            />
          </div>
        </div>
        {guide.managedVsByo.composioManagedAvailable === false ? (
          <p className="text-base leading-6 text-muted-foreground">
            No Composio managed OAuth app for {guide.name} — use a custom OAuth
            app with the provider.
          </p>
        ) : (
          <p className="text-base leading-6 text-muted-foreground">
            Check out Composio&apos;s{" "}
            <a
              href={composioToolkitDocsUrl(guide.composioSlug ?? guide.slug)}
              target="_blank"
              rel="noreferrer"
              className="text-brand-ink underline-offset-4 hover:underline"
            >
              managed OAuth app for {guide.name}
            </a>
            .
          </p>
        )}
      </section>

      <Separator className="bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl tracking-tight">
          Setting up a custom OAuth app
        </h2>
        <p className="text-base leading-6 text-muted-foreground">
          Pick a path below. Requirements, mistakes, and the to-do checklist
          update for that path — plus shared Composio wiring steps.
        </p>
        <PathForkTree
          providerName={guide.name}
          forks={guide.pathForks}
          selectedIndex={resolved.pathIndex}
          onSelect={selectPath}
        />
      </section>

      {/* Signals that requirements / mistakes / checklist below follow the selected path. */}
      <h2 className="text-xl tracking-tight">
        Path {resolved.pathIndex + 1}: {resolved.path.name}
      </h2>

      <section className="space-y-3">
        <h2 className="text-xl tracking-tight">What you&apos;ll need</h2>
        <List items={resolved.requirements} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl tracking-tight">Common mistakes</h2>
        <List items={resolved.gotchas} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl tracking-tight">To-do checklist</h2>
        <p className="text-base leading-6 text-muted-foreground">
          For Path {resolved.pathIndex + 1}. Tick steps as you finish them —
          progress is saved in this browser.
        </p>
        <StepsChecklist
          slug={guide.slug}
          pathIndex={resolved.pathIndex}
          steps={resolved.steps}
        />
      </section>

      <section className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-xl tracking-tight">An AI helper can</h2>
          <List items={guide.agentCanDo} />
        </div>
        <div className="space-y-3">
          <h2 className="text-xl tracking-tight">You still need to</h2>
          <List items={guide.humanMustDo} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl tracking-tight">
          Common Bottlenecks and Fixes
        </h2>
        {resolved.blockers.length === 0 ? (
          <p className="text-base leading-6 text-muted-foreground">
            No path-specific blockers listed — check the common mistakes above.
          </p>
        ) : (
          <ul className="space-y-3">
            {resolved.blockers.map((b) => (
              <li
                key={b.blocker}
                className="rounded-lg border border-border bg-card p-4 text-base leading-6"
              >
                <p className="tracking-tight text-foreground">{b.blocker}</p>
                <p className="mt-1.5 text-muted-foreground">{b.unblock}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl tracking-tight">References</h2>
        <ul className="space-y-2.5 text-base leading-6">
          {guide.sources.map((s) => (
            <li key={s.url} className="flex flex-wrap items-center gap-2">
              <a
                href={s.url}
                className="text-brand-ink underline-offset-4 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {s.title}
              </a>
              <MonoChip
                tone={s.confidence === "verified" ? "brand" : "muted"}
              >
                {s.confidence === "verified"
                  ? "checked"
                  : s.confidence === "inferred"
                    ? "likely"
                    : "unconfirmed"}
              </MonoChip>
            </li>
          ))}
        </ul>
        {guide.lastReviewed ? (
          <p className="font-mono text-sm text-muted-foreground">
            Last reviewed {guide.lastReviewed}
          </p>
        ) : null}
      </section>
    </article>
  );
}
