import { COMPOSIO_OAUTH_CALLBACK, type Guide } from "../schema";

/** Curated Gmail / Google guide — custom OAuth app + verification waits. */
export const gmailGuide: Guide = {
  slug: "gmail",
  name: "Gmail",
  website: "https://gmail.com",
  composioSlug: "GMAIL",
  summary:
    "A custom OAuth app for Gmail is where people most often underestimate waiting time. Creating a Google Cloud project and OAuth client can take an hour. Letting many external users connect — especially with sensitive mail permissions — can mean days or weeks of Google review, privacy policy and demo video feedback, and sometimes a security assessment.",
  managedVsByo: {
    composioManagedAvailable: true,
    recommendation:
      "Prototype with Composio’s managed OAuth app for Gmail. For production branding, extra permissions, or your own usage limits, create a Google Cloud OAuth client — and plan review based on how sensitive your permissions are. Creating the client is not the same as “ready for everyone.”",
    whenToStayManaged: [
      "Demos and internal tests",
      "You’re OK with Composio on the Google consent screen",
      "You’re still validating whether email agents matter for your product",
    ],
    whenToStartByo: [
      "External users must see your brand on Google’s consent screen",
      "You need permissions beyond Composio’s defaults",
      "You’re heading toward real user volume",
    ],
  },
  difficulty: "hard",
  activeEffortAtAGlance: "2–6 hrs",
  calendarWaitAtAGlance: "Days–weeks",
  activeEffort:
    "Cloud Console, consent screen, privacy page, demo video, then Composio wiring.",
  calendarWait:
    "Brand ~2–3 days; sensitive up to ~10 days; restricted often ~6 weeks+. Testing mode covers a small test-user set.",
  recommendedPathIndex: 0,
  pathForks: [
    {
      name: "Testing / internal only",
      description:
        "Keep your custom OAuth app in Testing, or Internal for a Google Workspace company. Enough to develop without full public review.",
      effortAtAGlance: "2–4 hrs",
      calendarWaitAtAGlance: "None",
      activeEffort:
        "Cloud project, consent screen, OAuth client, test users, Composio wiring.",
      calendarWait:
        "No public verification — limited to test users (or Internal Workspace users).",
      requirements: [
        "Test users listed on the consent screen (if in Testing)",
      ],
      gotchas: [
        "Creating the client ≠ verified for all users — only listed test users can connect in Testing.",
      ],
      steps: [
        "List what your agent needs in Gmail; map to the smallest Google permissions.",
        "Create/select a Google Cloud project; enable Gmail API; set up the consent screen.",
        `Create a Web OAuth client; add redirect ${COMPOSIO_OAUTH_CALLBACK}.`,
        "Add test users (Testing) or use Internal for Workspace-only.",
      ],
      blockers: [
        {
          blocker: "Unverified app screen / only a few test users can connect",
          unblock:
            "Add more test users for development, or move to Path 2/3 verification before a broad launch.",
        },
      ],
    },
    {
      name: "Sensitive permissions",
      description:
        "Opening your custom OAuth app to many external users usually needs sensitive-scope verification (branding, privacy policy, demo).",
      effortAtAGlance: "2–10 days",
      calendarWaitAtAGlance: "2–10 days",
      activeEffort:
        "Same Cloud setup as testing, plus privacy policy, branding, and demo video for verification.",
      calendarWait:
        "Brand checks ~2–3 business days; sensitive scopes up to ~10 business days (estimates, not promises).",
      requirements: [
        "A public privacy policy URL (and Limited Use language when required)",
        "A short demo video showing login and how you use the permissions",
        "Clear reasons for each sensitive permission",
      ],
      gotchas: [
        "Changing permissions mid-review can reset or complicate the process.",
        "Official timelines are estimates — don’t promise fixed dates.",
      ],
      steps: [
        "Complete Path 1 setup (project, consent screen, OAuth client, Composio wiring).",
        "Publish privacy policy and align branding with Google’s rules.",
        "Record and upload the demo video; submit sensitive-scope verification.",
        "Track status in Verification Center and reply to reviewers.",
      ],
      blockers: [
        {
          blocker: "Verification stuck with no email",
          unblock:
            "Check Verification Center; watch the developer contact inbox (and spam); avoid restarting unless you have to.",
        },
      ],
    },
    {
      name: "Restricted permissions (e.g. broad Gmail access)",
      description:
        "Stricter review for your custom OAuth app, and sometimes a paid third-party security assessment.",
      effortAtAGlance: "~6 wks+",
      calendarWaitAtAGlance: "~6 wks+",
      activeEffort:
        "Full verification package plus possible security assessment scheduling.",
      calendarWait:
        "Restricted scopes often sit around ~6 weeks+ including assessment — community reports can run longer.",
      requirements: [
        "Everything from Path 2 (sensitive verification)",
        "Budget/time for a third-party security assessment if Google requires it",
      ],
      gotchas: [
        "Some Gmail permission levels may require a costly security assessment.",
        "Ask whether you truly need restricted scopes before starting.",
      ],
      steps: [
        "Confirm you need restricted scopes; prefer narrower permissions if possible.",
        "Complete Path 2 materials (privacy, demo, branding).",
        "Submit restricted verification; schedule/pay for assessment if asked.",
        "While waiting, keep product progress moving — don’t freeze the roadmap on Google’s queue.",
      ],
      blockers: [
        {
          blocker: "Asked for a security assessment",
          unblock:
            "Confirm you truly need restricted permissions; if yes, budget time and cost; if not, reduce permissions and resubmit on Path 2.",
        },
      ],
    },
  ],
  requirements: [
    "A Google Cloud project with Gmail API (and related APIs) enabled",
    "OAuth consent screen filled in (name, support email, logo, domains as required)",
    "A Web application OAuth client (custom OAuth app) with the right redirect URL",
    `Redirect for Composio: ${COMPOSIO_OAUTH_CALLBACK}`,
  ],
  gotchas: [
    "redirect_uri_mismatch is very common; the URL must match exactly.",
  ],
  steps: [
    "Wire Client ID/secret into a Composio auth config (“use your own credentials”) and test end-to-end.",
  ],
  blockers: [],
  agentCanDo: [
    "Fetch Google’s published verification timelines and permission categories",
    "Draft a “minimum permissions” proposal from your tool list",
    "Outline a privacy-policy / demo-video checklist from common rejection themes",
    "Write Composio wiring steps for a custom OAuth app",
    "Label time estimates as from docs vs from community stories",
  ],
  humanMustDo: [
    "Own the Google Cloud project and custom OAuth client",
    "Publish a privacy policy and fix branding when verification requires it",
    "Record and submit the demo video; reply to reviewers",
    "Pay for / schedule a security assessment if restricted rules apply",
    "Decide product tradeoffs if review threatens launch",
  ],
  sources: [
    {
      title: "Google — OAuth verification FAQ (timelines)",
      url: "https://support.google.com/cloud/answer/13463817",
      confidence: "verified",
    },
    {
      title: "Sensitive scope verification",
      url: "https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification",
      confidence: "verified",
    },
    {
      title: "Community — multi-month verification experiences",
      url: "https://thomasstep.com/blog/google-oauth-verification-experience",
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
