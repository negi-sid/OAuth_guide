import { COMPOSIO_OAUTH_CALLBACK, type Guide } from "../schema";

/** Curated Notion guide — custom OAuth app via public integration. */
export const notionGuide: Guide = {
  slug: "notion",
  name: "Notion",
  website: "https://www.notion.so",
  composioSlug: "NOTION",
  summary:
    "A custom OAuth app for Notion is usually a public integration: create it in Notion’s developer portal, set Composio’s callback URL, then paste Client ID and secret into a Composio auth config. There’s typically no long app-review wait.",
  managedVsByo: {
    composioManagedAvailable: true,
    recommendation:
      "Use Composio’s managed OAuth app for Notion while building. Switch to a custom OAuth app before launch if users should see your product name, or if you need capabilities beyond the defaults.",
    whenToStayManaged: [
      "You’re still prototyping a workspace agent",
      "Default permissions are enough",
      "Internal tools where “Composio” on the login screen is fine",
    ],
    whenToStartByo: [
      "External users should see your product name",
      "You need capabilities beyond Composio’s defaults",
      "You want credentials you fully control",
    ],
  },
  difficulty: "easy",
  activeEffortAtAGlance: "30–60 min",
  calendarWaitAtAGlance: "Usually none",
  activeEffort:
    "Create a public Notion integration and paste credentials into Composio.",
  calendarWait:
    "Workspace members may still need to share pages with your integration.",
  recommendedPathIndex: 1,
  pathForks: [
    {
      name: "Internal integration (usually wrong for products)",
      description:
        "Tied to one Notion workspace. Fine for yourself — not a custom OAuth app path for “any user’s Notion.”",
      effortAtAGlance: "~15 min",
      calendarWaitAtAGlance: "None",
      activeEffort: "Create an internal integration in one workspace.",
      calendarWait: "No OAuth review — but it won’t scale to other users’ workspaces.",
      requirements: [
        "Access to a single Notion workspace where the integration will live",
      ],
      gotchas: [
        "Internal integrations cannot be the multi-user OAuth path for an agent product.",
      ],
      steps: [
        "Open Notion’s integrations site and create an internal integration.",
        "Copy the internal secret if you only need one-workspace automation.",
        "Stop here if you need multi-user OAuth — switch to Path 2 (public integration) instead.",
      ],
      blockers: [
        {
          blocker: "You need customers to connect their own Notion",
          unblock:
            "Create a public integration with OAuth (Path 2) and update Composio credentials.",
        },
      ],
    },
    {
      name: "Public integration (custom OAuth app)",
      description:
        "Users approve your custom OAuth app across workspaces through a normal OAuth flow.",
      effortAtAGlance: "~45 min",
      calendarWaitAtAGlance: "Usually none",
      activeEffort:
        "Create a public integration, set callback, wire into Composio.",
      calendarWait:
        "No long review queue; users must still share pages with your integration.",
      requirements: [
        "A public integration with OAuth turned on",
        "A clear list of capabilities (pages, databases, comments, etc.)",
      ],
      gotchas: [
        "After login, users must still share pages/databases — connect alone isn’t full workspace access.",
        "Changing capabilities later may mean users need to approve again.",
      ],
      steps: [
        "Open Notion’s integrations / developer site and create a public integration.",
        "Copy Client ID and Secret.",
        `Add callback URL ${COMPOSIO_OAUTH_CALLBACK}.`,
        "Turn on only the capabilities your agent needs.",
      ],
      blockers: [
        {
          blocker: "Login works but tools still fail",
          unblock:
            "Have the user share the target page or database with your integration — Notion access is per resource.",
        },
      ],
    },
  ],
  requirements: [
    "A Notion developer / integrations account",
    `Callback URL: ${COMPOSIO_OAUTH_CALLBACK} (exact match)`,
    "Client ID and secret in a Composio auth config",
  ],
  gotchas: [
    "Typos in the callback URL break login silently.",
  ],
  steps: [
    "Create a Composio auth config with those credentials and the same callback (“use your own credentials”).",
    "Test connect, then share a test page with the integration and try one action.",
  ],
  blockers: [],
  agentCanDo: [
    "Pull Notion’s public integration / OAuth docs",
    "Draft a capability checklist from your agent’s planned actions",
    "Write Composio wiring steps and callback reminders for a custom OAuth app",
  ],
  humanMustDo: [
    "Create the Notion integration under your team",
    "Pick final capabilities",
    "Store secrets and create the Composio auth config",
    "Confirm page-sharing works in a real workspace",
  ],
  sources: [
    {
      title: "Notion authorization basics",
      url: "https://developers.notion.com/docs/authorization",
      confidence: "verified",
    },
    {
      title: "Composio programmatic auth configs",
      url: "https://docs.composio.dev/docs/authentication/programmatic-auth-configs",
      confidence: "verified",
    },
    {
      title: "Composio managed OAuth directory",
      url: "https://docs.composio.dev/toolkits/managed-auth",
      confidence: "verified",
    },
  ],
  lastReviewed: "2026-10-29",
  generated: false,
};
