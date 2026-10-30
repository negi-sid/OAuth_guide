import Link from "next/link";
import { listGuides } from "@/lib/guides";
import { ProviderLogo } from "@/components/provider-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** OAuth Guidance — entered from Toolkits → OAuth Guidance tile. */
export default function OauthHomePage() {
  const guides = listGuides();

  return (
    <div className="min-h-full bg-background">
      <section className="mx-auto max-w-7xl px-4 pb-14 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <Link
          href="/"
          className="font-mono text-sm uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        >
          From Toolkits → OAuth Guidance
        </Link>
        <h1 className="mt-3 max-w-3xl text-[1.875rem] leading-9 tracking-tight text-foreground sm:text-[2rem] sm:leading-10">
          OAuth guidance for developers building agents
        </h1>
        <p className="mt-5 text-base leading-6 text-muted-foreground">
          Before users can connect their apps to your AI agent, you will need
          an OAuth app — for authentication, authorisation, and permissions.
          These guides help you choose managed vs custom, estimate setup
          effort and review timelines, and see what you can automate versus
          what still needs a human.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-28 sm:px-6 lg:px-8">
        <h2 className="text-xl tracking-tight text-foreground">
          Pre-built Guides
        </h2>
        <p className="mt-2 max-w-2xl text-base leading-6 text-muted-foreground">
          Curated walkthroughs for common providers, covering setup effort,
          review timelines, and what you can automate versus what still needs a
          human.
        </p>

        <div className="mt-8 border border-border bg-card p-5 sm:p-6">
          <p className="text-base leading-6 text-foreground">
            Your provider guide is not in the list? Generate a guide using our
            AI helper
          </p>
          <div className="mt-4">
            <Link
              href="/generate"
              className={cn(buttonVariants({ size: "lg" }), "rounded-none")}
            >
              Generate Guide
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <div className="mb-4 flex items-center gap-3">
                <ProviderLogo name={guide.slug} size={24} />
                <h3 className="text-lg tracking-tight text-foreground group-hover:text-brand">
                  {guide.name}
                </h3>
              </div>
              <p className="line-clamp-3 text-base leading-6 text-muted-foreground">
                {guide.summary}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
