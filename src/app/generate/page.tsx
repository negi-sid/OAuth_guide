import { GenerateForm } from "@/components/generate-form";

/** Live generation — Composio DEV surface; wide shell aligned with toolkits. */
export default function GeneratePage() {
  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl space-y-4">
          <h1 className="text-[1.875rem] leading-9 tracking-tight sm:text-[2rem] sm:leading-10">
            Generate a guide
          </h1>
          <p className="text-base leading-6 text-muted-foreground">
            Type an app name or paste its website. An AI helper looks up public
            docs and writes a clear setup guide you can share — even for apps
            we haven’t listed yet. It won’t create accounts or submit approvals
            for you.
          </p>
        </div>
        <GenerateForm />
      </div>
    </div>
  );
}
