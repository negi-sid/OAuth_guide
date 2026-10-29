"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, MessageSquare, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/#", label: "Docs", placeholder: true },
  { href: "/#", label: "Knowledge Base", placeholder: true },
  { href: "/#", label: "Examples", placeholder: true },
  { href: "/", label: "Toolkits", placeholder: false },
  { href: "/#", label: "Reference", placeholder: true },
] as const;

/**
 * Docs-style Composio chrome — logo + (assignment), product switcher stub, nav.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const onToolkits = pathname === "/";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex shrink-0 flex-col gap-0.5 outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/Logo-White.svg"
            alt="Composio"
            width={120}
            height={23}
            className="h-5 w-auto"
          />
          <span className="font-mono text-xs lowercase leading-none tracking-wide text-muted-foreground group-hover:text-brand">
            (assignment)
          </span>
        </Link>

        {/* Product switcher — placeholder */}
        <button
          type="button"
          className="hidden items-center gap-1 rounded-md border border-border px-2 py-1 font-mono text-xs uppercase tracking-wider text-emerald-400 sm:inline-flex"
          title="Placeholder"
        >
          Platform
          <ChevronDown className="size-3.5 opacity-70" />
        </button>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active =
              item.label === "Toolkits"
                ? onToolkits
                : false;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={item.placeholder ? (e) => e.preventDefault() : undefined}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  active
                    ? "text-brand"
                    : "text-muted-foreground hover:text-foreground",
                  item.placeholder && "cursor-default opacity-80",
                )}
                aria-disabled={item.placeholder}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-overlay hover:text-foreground"
            title="Search (placeholder)"
          >
            <Search className="size-4" />
          </button>
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-overlay hover:text-foreground"
            title="Ask AI (placeholder)"
          >
            <MessageSquare className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
