import Link from "next/link";
import {
  Copy,
  ExternalLink,
  LayoutGrid,
  Search,
  Shield,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { ProviderLogo } from "@/components/provider-logo";
import { CopyableTag } from "@/components/copyable-tag";

/** Placeholder popular toolkit rows — visual only. */
const PLACEHOLDER_TOOLKITS = [
  { name: "GitHub", slug: "GITHUB", logo: "github", tools: 48, triggers: 12 },
  { name: "Gmail", slug: "GMAIL", logo: "gmail", tools: 36, triggers: 8 },
  { name: "Slack", slug: "SLACK", logo: "slack", tools: 52, triggers: 15 },
  { name: "Notion", slug: "NOTION", logo: "notion", tools: 41, triggers: 6 },
  {
    name: "Google Calendar",
    slug: "GOOGLECALENDAR",
    logo: "googlecalendar",
    tools: 28,
    triggers: 9,
  },
  { name: "Linear", slug: "LINEAR", logo: "linear", tools: 33, triggers: 7 },
  { name: "HubSpot", slug: "HUBSPOT", logo: "hubspot", tools: 64, triggers: 11 },
  {
    name: "Salesforce",
    slug: "SALESFORCE",
    logo: "salesforce",
    tools: 72,
    triggers: 14,
  },
] as const;

const TILES = [
  {
    title: "Managed OAuth apps",
    description: "Check which toolkits have managed OAuth",
    icon: Shield,
    href: null as string | null,
  },
  {
    title: "OAuth Guidance",
    description:
      "Step-by-step guides for setting up OAuth",
    icon: Sparkles,
    href: "/oauth",
  },
  {
    title: "Meta Tools",
    description: "The system tools every session gives your agent",
    icon: Wrench,
    href: null,
  },
  {
    title: "Instant Tools",
    description: "Show toolkits with Instant tools",
    icon: Zap,
    href: null,
  },
] as const;

/**
 * Replica of docs.composio.dev/toolkits — placeholders for catalog chrome;
 * the OAuth Guidance tile enters the OAuth Readiness experience.
 * Type/width tuned to docs density: ~16px body, ~30px H1, ~14px tiles, wide shell.
 */
export function ToolkitsPage() {
  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        {/* Title row — docs H1 ~30px / subtitle 16px */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[1.875rem] leading-9 tracking-tight text-foreground">
              Toolkits
            </h1>
            <p className="mt-2 text-base leading-6 text-muted-foreground">
              Browse 1688 toolkits supported by Composio
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm text-foreground/80"
              title="Placeholder"
            >
              <Copy className="size-3.5" />
              Copy page
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm text-foreground/80"
              title="Placeholder"
            >
              Playground
              <ExternalLink className="size-3.5" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-brand px-3 text-sm text-brand-on-brand"
              title="Placeholder"
            >
              <LayoutGrid className="size-3.5" />
              Request Tools
            </button>
          </div>
        </div>

        {/* Feature tiles — docs tile title/desc ~14px */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {TILES.map((tile) => {
            const Icon = tile.icon;
            const inner = (
              <>
                <Icon className="size-5 text-foreground/80" strokeWidth={1.5} />
                <div>
                  <h2 className="text-sm leading-5 tracking-tight text-foreground">
                    {tile.title}
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    {tile.description}
                  </p>
                </div>
              </>
            );

            if (tile.href) {
              return (
                <Link
                  key={tile.title}
                  href={tile.href}
                  className="relative flex items-start gap-3 border border-brand/45 bg-card p-4 shadow-[inset_0_0_0_1px_rgba(81,162,255,0.08)] transition-colors hover:border-brand hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <span className="absolute right-3 top-3 rounded-sm border border-brand/40 px-1.5 py-0.5 font-mono text-xs tracking-wider text-brand">
                    Click Here
                  </span>
                  {inner}
                </Link>
              );
            }

            return (
              <div
                key={tile.title}
                className="flex cursor-default items-start gap-3 border border-border bg-card/80 p-4 opacity-90"
                title="Placeholder — not wired in this assignment"
              >
                {inner}
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-base leading-6 text-foreground/70">
          <span className="inline-flex items-center gap-1">
            Read the Instant Tools guide
            <span aria-hidden>→</span>
          </span>
          <span className="ml-2 font-mono text-xs text-muted-foreground">
            (placeholder)
          </span>
        </p>

        {/* Search — placeholder */}
        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search toolkits..."
            disabled
            className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-base leading-6 text-muted-foreground placeholder:text-muted-foreground/70"
          />
        </div>

        {/* Catalog list — row names ~16px like docs */}
        <div className="mt-8">
          <div className="flex items-baseline gap-3">
            <p className="text-base leading-6 text-muted-foreground">
              1688 toolkits
            </p>
          </div>
          <h2 className="mt-4 text-base leading-6 tracking-tight text-foreground">
            Popular
          </h2>

          <ul className="mt-2 divide-y divide-border border-t border-border">
            {PLACEHOLDER_TOOLKITS.map((tk) => (
              <li key={tk.slug}>
                <div
                  className="flex items-center gap-3 py-3.5"
                  title="Placeholder row"
                >
                  <ProviderLogo name={tk.logo} size={20} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base leading-6 text-foreground">
                        {tk.name}
                      </span>
                      <CopyableTag value={tk.slug} />
                    </div>
                  </div>
                  <div className="hidden items-center gap-4 font-mono text-xs text-muted-foreground sm:flex">
                    <span className="inline-flex items-center gap-1">
                      <Wrench className="size-3.5" />
                      {tk.tools}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Zap className="size-3.5" />
                      {tk.triggers}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            Catalog rows are placeholders for this assignment demo.
          </p>
        </div>
      </div>
    </div>
  );
}
