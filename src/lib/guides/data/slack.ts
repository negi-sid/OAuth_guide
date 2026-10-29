import { COMPOSIO_OAUTH_CALLBACK, type Guide } from "../schema";

/** Curated Slack guide — custom OAuth app + distribution choices. */
export const slackGuide: Guide = {
  slug: "slack",
  name: "Slack",
  // Slack app directory — create/configure the custom OAuth app here.
  website: "https://api.slack.com/apps",
  composioSlug: "SLACK",
  summary:
    "Creating a custom OAuth app (your Slack app) and getting credentials is usually a same-day job. The trap is distribution: testing only in your workspace ≠ letting customer workspaces install; public distribution is often enough and does not need Marketplace review; Marketplace listing can take weeks.",
  managedVsByo: {
    composioManagedAvailable: true,
    recommendation:
      "Composio’s managed OAuth app for Slack is fine for prototypes. Create a custom OAuth app (your own Slack app) when you need your name on install, extra permissions, or a Marketplace listing under your brand.",
    whenToStayManaged: [
      "Early demos inside one workspace",
      "Default permissions work",
      "OK if install branding says Composio for now",
    ],
    whenToStartByo: [
      "Customers need to install into their own Slack workspaces",
      "You need permissions beyond the defaults",
      "You want a Slack Marketplace listing",
    ],
  },
  difficulty: "medium",
  activeEffortAtAGlance: "1–3 hrs",
  calendarWaitAtAGlance: "0–10 wks",
  activeEffort:
    "Create the Slack app, set scopes and callback, finish distribution.",
  calendarWait:
    "Public distribution is usually immediate; Marketplace listing can take up to ~10 weeks.",
  recommendedPathIndex: 1,
  pathForks: [
    {
      name: "Only your workspace",
      description:
        "Install your custom OAuth app in the workspace that owns it. Great for personal testing — fails for other companies’ Slacks.",
      effortAtAGlance: "~20 min",
      calendarWaitAtAGlance: "None",
      activeEffort: "Create the Slack app and install it in your own workspace.",
      calendarWait: "No distribution or Marketplace wait.",
      requirements: [
        "A Slack workspace you admin for testing",
      ],
      gotchas: [
        "Other workspaces cannot install until you turn on public distribution (Path 2).",
      ],
      steps: [
        "Create a Slack app at api.slack.com/apps.",
        `Add the OAuth redirect URL from Composio (commonly ${COMPOSIO_OAUTH_CALLBACK}).`,
        "Add the minimum bot/user scopes your agent needs.",
        "Install the app only in your development workspace and test connect.",
      ],
      blockers: [
        {
          blocker: "Customer workspace can’t install your app",
          unblock:
            "Switch to Path 2 — finish Manage Distribution and Activate Public Distribution.",
        },
      ],
    },
    {
      name: "Public distribution (unlisted)",
      description:
        "Turn on public distribution so any workspace can install your custom OAuth app. Fixes the common “non_distributed_app” error. Does not require Marketplace approval.",
      effortAtAGlance: "1–3 hrs",
      calendarWaitAtAGlance: "Usually immediate",
      activeEffort:
        "Create the app, scopes, callback, then finish the public distribution checklist.",
      calendarWait:
        "Public distribution is usually immediate after Slack’s checklist — no Marketplace review.",
      requirements: [
        "HTTPS callback URLs (Slack requirement)",
        "Manage Distribution checklist completed",
      ],
      gotchas: [
        "Error invalid_team_for_non_distributed_app → public distribution isn’t on (you don’t need Marketplace for this).",
        "Changing scopes after installs may force users to reconnect.",
      ],
      steps: [
        "Create a Slack app; add the OAuth redirect URL from Composio.",
        "Add the minimum permissions your agent needs.",
        "Install in your dev workspace and test connect through Composio.",
        "Open Manage Distribution → finish the checklist → Activate Public Distribution.",
        "Test install from a second workspace.",
      ],
      blockers: [
        {
          blocker: "invalid_team_for_non_distributed_app",
          unblock:
            "Turn on Public Distribution in the Slack app dashboard. You don’t need Marketplace approval for this error.",
        },
      ],
    },
    {
      name: "Slack Marketplace listing",
      description:
        "Optional directory listing for your custom OAuth app with Slack’s review process.",
      effortAtAGlance: "~10 wks",
      calendarWaitAtAGlance: "~10 wks",
      activeEffort:
        "Same custom OAuth app setup as public distribution, plus Marketplace submission materials.",
      calendarWait:
        "Early feedback can take ~10 business days; full new-app review can take up to ~10 weeks.",
      requirements: [
        "Public distribution already working",
        "Marketplace listing materials (description, icons, privacy policy as required)",
      ],
      gotchas: [
        "Marketplace timeline ≠ distribution timeline — ship with public distribution first.",
        "Some workspaces only allow Marketplace apps — that’s the customer’s policy.",
      ],
      steps: [
        "Complete Path 2 first (public distribution) so installs work without the listing.",
        "Prepare Marketplace listing assets and submit for review.",
        "Reply to Marketplace reviewers; treat review as a parallel marketing track.",
      ],
      blockers: [
        {
          blocker: "Launch blocked waiting on Marketplace",
          unblock:
            "Ship with public distribution first; treat Marketplace as a separate track with a multi-week buffer.",
        },
      ],
    },
  ],
  requirements: [
    "A Slack app at api.slack.com/apps (your custom OAuth app)",
    "OAuth redirect URLs that include Composio’s callback",
    "Only the bot/user permissions your agent actually needs",
    `Composio callback is commonly: ${COMPOSIO_OAUTH_CALLBACK}`,
  ],
  gotchas: [
    "Redirect URL must match exactly over HTTPS.",
  ],
  steps: [
    "Create a Composio auth config with Client ID/Secret and matching redirect (“use your own credentials”); use it in sessions.",
  ],
  blockers: [],
  agentCanDo: [
    "Explain distribution vs Marketplace with published timing ranges",
    "Draft a permission list from what your agent should do",
    "Remind you about the public distribution checklist",
    "Explain the non_distributed_app error from docs",
  ],
  humanMustDo: [
    "Create and own the Slack custom OAuth app",
    "Click Activate Public Distribution after the checklist (when on Path 2+)",
    "Reply to Marketplace reviewers if you submit",
    "Wire credentials into Composio and test a real connect",
  ],
  sources: [
    {
      title: "Slack — App lifecycle & distribution",
      url: "https://docs.slack.dev/app-management/distribution/",
      confidence: "verified",
    },
    {
      title: "Slack Marketplace review guide (timelines)",
      url: "https://docs.slack.dev/slack-marketplace/slack-marketplace-review-guide",
      confidence: "verified",
    },
    {
      title: "Nango — invalid_team_for_non_distributed_app",
      url: "https://nango.dev/blog/fix-slack-oauth-error-invalid-team-for-non-distributed-app/",
      confidence: "inferred",
    },
    {
      title: "Composio managed vs custom auth",
      url: "https://docs.composio.dev/docs/authentication/custom-app-vs-managed-app",
      confidence: "verified",
    },
  ],
  lastReviewed: "2026-10-29",
  generated: false,
};
