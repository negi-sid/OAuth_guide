import {
  resolvePathContent,
  type Guide,
} from "./schema";

/** Serialize a guide to Markdown for copy/share without a DB. */
export function guideToMarkdown(
  guide: Guide,
  pathIndex: number = guide.recommendedPathIndex,
): string {
  const resolved = resolvePathContent(guide, pathIndex);

  const lines: string[] = [
    `# OAuth setup guide: ${guide.name}`,
    "",
    guide.summary,
    "",
    `**How hard:** ${guide.difficulty}  `,
    `**Selected path:** Path ${resolved.pathIndex + 1} — ${resolved.path.name}  `,
    `**Your hands-on time:** ${resolved.activeEffortAtAGlance} — ${resolved.activeEffort}  `,
    `**Waiting on review:** ${resolved.calendarWaitAtAGlance} — ${resolved.calendarWait}  `,
    `**Website:** ${guide.website}  `,
    guide.composioSlug ? `**Composio id:** \`${guide.composioSlug}\`  ` : "",
    "",
    "## Managed OAuth app, or custom OAuth app?",
    "",
    "Composio provides a [managed OAuth app](https://docs.composio.dev/toolkits/managed-auth) for many toolkits — the simplest way to connect users without registering credentials at the provider yourself.",
    "",
    "You may want a custom OAuth app when you need your brand on the consent screen, permissions beyond Composio’s defaults, your own usage limits, or when no managed OAuth app is available.",
    "",
    `**For this toolkit:** ${guide.managedVsByo.recommendation}`,
    "",
    "### Stay on the managed OAuth app when",
    ...guide.managedVsByo.whenToStayManaged.map((x) => `- ${x}`),
    "",
    "### Use a custom OAuth app when",
    ...guide.managedVsByo.whenToStartByo.map((x) => `- ${x}`),
    "",
    "## Setting up a custom OAuth app",
    "",
    `Selected: **Path ${resolved.pathIndex + 1}: ${resolved.path.name}**`,
    "",
    resolved.path.description,
    "",
    "```",
    `Custom OAuth app · ${guide.name}`,
    "└── paths",
    ...guide.pathForks.flatMap((f, i, arr) => {
      const branch = i === arr.length - 1 ? "└──" : "├──";
      const mark = i === resolved.pathIndex ? " (selected)" : "";
      return [
        `${branch} Path ${i + 1}: ${f.name}${mark}`,
        `    ${f.description}`,
        `    Time: ${f.effortAtAGlance} · Wait: ${f.calendarWaitAtAGlance}`,
      ];
    }),
    "```",
    "",
    "## What you'll need",
    ...resolved.requirements.map((x) => `- ${x}`),
    "",
    "## Common mistakes",
    ...resolved.gotchas.map((x) => `- ${x}`),
    "",
    "## To-do checklist",
    ...resolved.steps.map((x, i) => `- [ ] ${i + 1}. ${x}`),
    "",
    "## An AI helper can",
    ...guide.agentCanDo.map((x) => `- ${x}`),
    "",
    "## You still need to",
    ...guide.humanMustDo.map((x) => `- ${x}`),
    "",
    "## Common Bottlenecks and Fixes",
    ...(resolved.blockers.length
      ? resolved.blockers.flatMap((b) => [
          `- **${b.blocker}** → ${b.unblock}`,
        ])
      : ["- No path-specific blockers listed."]),
    "",
    "## References",
    ...guide.sources.map(
      (s) => `- [${s.title}](${s.url}) (${s.confidence})`,
    ),
    "",
    guide.lastReviewed
      ? `_Last reviewed: ${guide.lastReviewed}_`
      : guide.generated
        ? `_AI generated — double-check claims against the sources above._`
        : "",
  ];

  return lines.filter((l) => l !== undefined).join("\n");
}
