import Image from "next/image";
import { providerLogoSrc } from "@/lib/provider-logos";
import { cn } from "@/lib/utils";

type ProviderLogoProps = {
  /** Guide slug, Composio slug, or brand name used to look up the mark. */
  name: string;
  size?: number;
  className?: string;
};

/**
 * Renders a real brand logo when we have one locally; otherwise a letter fallback.
 */
export function ProviderLogo({
  name,
  size = 28,
  className,
}: ProviderLogoProps) {
  const src = providerLogoSrc(name);

  if (src) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-overlay",
          className,
        )}
        style={{ width: size + 12, height: size + 12 }}
      >
        <Image
          src={src}
          alt=""
          width={size}
          height={size}
          className="object-contain"
          unoptimized
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-overlay font-mono text-sm text-muted-foreground",
        className,
      )}
      style={{ width: size + 12, height: size + 12 }}
      aria-hidden
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
