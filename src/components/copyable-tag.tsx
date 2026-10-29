"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type CopyableTagProps = {
  /** Value shown and copied to the clipboard. */
  value: string;
  className?: string;
};

/**
 * Inline mono tag with a copy control — used for toolkit ids like `GITHUB`.
 */
export function CopyableTag({ value, className }: CopyableTagProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be blocked; leave UI unchanged.
    }
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border border-border bg-overlay pl-1.5 font-mono text-xs tracking-wider text-muted-foreground",
        className,
      )}
    >
      <span>{value}</span>
      <button
        type="button"
        onClick={copy}
        className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        aria-label={copied ? "Copied" : `Copy ${value}`}
        title={copied ? "Copied" : "Copy"}
      >
        {copied ? (
          <Check className="size-3 text-brand" strokeWidth={3} />
        ) : (
          <Copy className="size-3" />
        )}
      </button>
    </span>
  );
}
