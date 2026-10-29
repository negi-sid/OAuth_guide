"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GuideView } from "@/components/guide-view";
import { ResearchLogPanel } from "@/components/research-log";
import type { Guide } from "@/lib/guides/schema";
import {
  LAST_GUIDE_KEY,
  readResearchLog,
  type ResearchLog,
} from "@/lib/generate-storage";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Shows the last live-generated guide + research log from sessionStorage. */
export default function GenerateResultPage() {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [researchLog, setResearchLog] = useState<ResearchLog | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LAST_GUIDE_KEY);
      if (!raw) {
        setMissing(true);
        return;
      }
      setGuide(JSON.parse(raw) as Guide);
      setResearchLog(readResearchLog());
    } catch {
      setMissing(true);
    }
  }, []);

  if (missing) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg space-y-4 text-center">
          <p className="text-base leading-6 text-muted-foreground">
            No generated guide in this browser session.
          </p>
          <Link href="/generate" className={cn(buttonVariants())}>
            Generate one
          </Link>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <p className="px-4 py-16 text-center font-mono text-sm text-muted-foreground sm:px-6 lg:px-8">
        Loading…
      </p>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          href="/generate"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Generate another
        </Link>
        {researchLog ? <ResearchLogPanel log={researchLog} /> : null}
      </div>
      <GuideView guide={guide} />
    </div>
  );
}
