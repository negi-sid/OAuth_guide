import { COMPOSIO_OAUTH_CALLBACK, type Guide } from "../schema";

/** Curated GitHub guide — custom OAuth app setup (usually the easiest). */
export const githubGuide: Guide = {
  slug: "github",
  name: "GitHub",
  // Developer settings — register a new OAuth App / GitHub App here.
  website: "https://github.com/settings/developers",
  composioSlug: "GITHUB",
  summary:
    "Creating a custom OAuth app on GitHub is one of the friendlier setups. Register an OAuth App or GitHub App, paste Composio’s callback URL, then add the Client ID and secret to a Composio auth config. There’s usually no long review wait like Google.",
  managedVsByo: {
    composioManagedAvailable: true,
    recommendation:
      "While you’re still building and testing, use Composio’s managed OAuth app for GitHub. Use a custom OAuth app when real users should see your product name on the “Allow access?” screen, or when you need permissions Composio’s defaults don’t include.",
    whenToStayManaged: [
      "You’re demoing or still figuring out the product",
      "Composio’s default permissions are enough",
      "It’s OK if the login screen says “Composio” for now",
    ],
    whenToStartByo: [
      "You’re shipping to real users and want your brand on the login screen",
      "You need extra permissions beyond the defaults",
      "A customer asks you to use a custom OAuth app",
    ],
  },
  difficulty: "easy",
  activeEffortAtAGlance: "20–45 min",
  calendarWaitAtAGlance: "Usually none",
  activeEffort: "Create the app in GitHub, then wire credentials into Composio.",
  calendarWait:
    "Org admins may still need to approve installs — that’s their policy, not a GitHub review queue.",
  recommendedPathIndex: 1,
  pathForks: [
    {
      name: "OAuth App (simpler)",
      description:
        "Classic “Sign in with GitHub” style for your custom OAuth app. Easiest mental model if you’re new.",
      effortAtAGlance: "~30 min",
      calendarWaitAtAGlance: "Usually none",
      activeEffort: "Create an OAuth App and paste credentials into Composio.",
      calendarWait: "No GitHub verification queue for creating the app.",
      requirements: [
        "Homepage URL and callback URL for the OAuth App",
      ],
      gotchas: [
        "OAuth Apps are simpler but GitHub recommends GitHub Apps for new products long-term.",
      ],
      steps: [
        "In GitHub → Settings → Developer settings → OAuth Apps, create a new OAuth App.",
        "Set the application name, homepage URL, and callback URL.",
        `Use callback ${COMPOSIO_OAUTH_CALLBACK} (or whatever Composio shows you).`,
        "Copy the Client ID and generate a Client Secret.",
      ],
      blockers: [
        {
          blocker: "Error about redirect / callback URL mismatch",
          unblock:
            "Copy the callback from Composio into the OAuth App settings again — both sides must match exactly.",
        },
      ],
    },
    {
      name: "GitHub App (recommended long-term)",
      description:
        "More control over what your custom OAuth app can access. GitHub prefers this for new products. A few more form fields, still no multi-week review.",
      effortAtAGlance: "~45 min",
      calendarWaitAtAGlance: "Usually none",
      activeEffort:
        "Create a GitHub App, set permissions, then wire into Composio.",
      calendarWait: "No GitHub verification queue for creating the app.",
      requirements: [
        "Permission selection for the GitHub App (only what your agent needs)",
        "Webhook settings if you use them (can disable if unused)",
      ],
      gotchas: [
        "GitHub App permissions are more granular — pick carefully before users install.",
        "Company orgs may still require admin approval for third-party GitHub Apps.",
      ],
      steps: [
        "In GitHub → Settings → Developer settings → GitHub Apps, create a new GitHub App.",
        "Set the callback URL and (if needed) setup URL / webhook.",
        `Use callback ${COMPOSIO_OAUTH_CALLBACK} (or whatever Composio shows you).`,
        "Choose the minimum repository/account permissions your agent needs.",
        "Generate a client secret (and note the App ID / Client ID Composio asks for).",
      ],
      blockers: [
        {
          blocker: "Users in a company org can’t connect",
          unblock:
            "Ask a GitHub org admin to approve your GitHub App, or test with a personal account first.",
        },
      ],
    },
  ],
  requirements: [
    `The redirect / callback URL must match Composio exactly: ${COMPOSIO_OAUTH_CALLBACK}`,
    "Only ask for the permissions your agent actually needs",
    "Client ID and secret saved in Composio under a custom auth config",
  ],
  gotchas: [
    "The callback URL must match character-for-character (including https and trailing slashes).",
    "Don’t confuse a personal access token with a multi-user custom OAuth app.",
    "If Composio’s dashboard shows a callback URL, use that exact one.",
  ],
  steps: [
    "In Composio, create an auth config for GitHub and choose “use your own credentials.”",
    "Paste the Client ID, secret, and matching callback.",
    "Point your agent session at that auth config for GitHub.",
    "Test once with a real GitHub account and confirm the consent screen shows your custom OAuth app name.",
  ],
  blockers: [],
  agentCanDo: [
    "Find GitHub’s official docs for OAuth Apps vs GitHub Apps",
    "Suggest a short permission list based on what your agent should do",
    "Draft a checklist for wiring custom OAuth credentials into Composio",
    "Warn you about company org admin approval",
  ],
  humanMustDo: [
    "Create the custom OAuth app under your GitHub account or org",
    "Generate and store the secret safely (don’t commit it to git)",
    "Choose the final permissions for your product",
    "Create the Composio auth config and test a real connect",
  ],
  sources: [
    {
      title: "Authorizing OAuth apps — GitHub Docs",
      url: "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps",
      confidence: "verified",
    },
    {
      title: "Differences between GitHub Apps and OAuth apps",
      url: "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps",
      confidence: "verified",
    },
    {
      title: "Composio — Managed vs custom auth",
      url: "https://docs.composio.dev/docs/authentication/custom-app-vs-managed-app",
      confidence: "verified",
    },
  ],
  lastReviewed: "2026-10-29",
  generated: false,
};
