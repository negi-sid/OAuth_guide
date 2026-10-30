"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Parent route when the user didn’t arrive via in-app navigation. */
function parentHref(pathname: string): string {
  if (pathname.startsWith("/guides/")) return "/oauth";
  if (pathname.startsWith("/generate/result")) return "/generate";
  if (pathname.startsWith("/generate")) return "/oauth";
  if (pathname.startsWith("/oauth")) return "/";
  return "/";
}

/**
 * Site-wide back control. Hidden on the home (Toolkits) page.
 * Links to the logical parent so cold loads and browser Back stay predictable.
 */
export function BackNav() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <Link
        href={parentHref(pathname)}
        className="font-mono text-sm uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
      >
        &lt; back
      </Link>
    </div>
  );
}
