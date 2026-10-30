# OAuth App Readiness (Composio take-home)

A focused experience for **agent / integration builders** who need end users to connect apps via Composio. Before launch, the hard question is rarely “how do I click OAuth?” — it is: *Can I stay on Composio’s managed OAuth app, or do I need a custom OAuth app with the provider — and how long will that take?*

**Live demo:** https://oauthaiguide.vercel.app  
**Repo:** https://github.com/negi-sid/OAuth_guide

---

## What you can try

1. **Home** (`/`) — Toolkits-style entry (mirrors Composio’s Toolkits surface); open **OAuth Guidance**
2. **Curated guides** (easy → hard):
   - [GitHub](/guides/github) — easy self-serve custom OAuth
   - [Notion](/guides/notion) — easy–medium console setup
   - [Slack](/guides/slack) — path forks (public distribution vs Marketplace)
   - [Gmail](/guides/gmail) — hard Google verification / calendar wait
3. **Live generate** (`/generate`) — submit any app name/website; an agent researches public docs and returns a shareable guide with the same schema. Copy Markdown from the result page.

Curated guides work without an API key. Live generation needs `OPENROUTER_API_KEY` on the server (set on the demo; never committed).

---

## Local setup

```bash
npm install
cp .env.example .env.local
# Add OPENROUTER_API_KEY=… from https://openrouter.ai/keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Variable | Required | Notes |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | For `/generate` | Server-only |
| `OPENROUTER_MODEL` | No | Default `openai/gpt-4o-mini` |
| `OPENROUTER_WEB_SEARCH_ENGINE` | No | e.g. `exa`, `native` |
| `OPENROUTER_WEB_SEARCH_MAX_RESULTS` | No | Default `5` |

---

## Product decisions

This section is the short version. For the full phased thought process — problem grounding, ranked research themes with links, the decision pack (D1–D7), and build notes — see [`NOTES.md`](./NOTES.md).

### Starting from what Composio already has

I grounded the problem in Composio’s existing auth model — not a greenfield OAuth tutorial:

- **Managed OAuth apps** (~124 toolkits) vs **custom OAuth apps** wired into auth configs (~258 “BYO” in the directory) — from [managed auth](https://docs.composio.dev/toolkits/managed-auth), [managed vs custom](https://docs.composio.dev/docs/authentication/custom-app-vs-managed-app), and [custom auth configs](https://docs.composio.dev/docs/auth-configuration/custom-auth-configs).
- Composio docs already state the tension: own app is recommended for production, but approvals take time — so a default managed app exists. The experience makes that tradeoff the **first** thing a builder sees.
- **Entry placement:** the journey starts on a Toolkits-style page (like docs.composio.dev/toolkits). Tiles 1–3 are placeholders; **OAuth Guidance** is the live product entry — so the take-home reads as an extension of Composio’s surface, not a disconnected microsite.
- **Language:** guides use Composio product terms (*managed OAuth app* / *custom OAuth app*) and always surface the Composio callback URL when discussing redirects.

### Why I took a different path

| Choice | Instead of | Why |
| --- | --- | --- |
| **Decision-first readiness guides** | Click-only setup walkthroughs | Research showed builders fail on *time uncertainty* and *late discovery that BYO is required* — not missing a single console click. |
| **4 curated apps + live gen** | A 100-guide library | Assignment asks for a focused slice; four apps span Easy → Hard difficulty drivers; live generation covers the long tail. |
| **Path forks inside a guide** | One linear “happy path” | Same provider can mean hours vs weeks (Slack distribute vs Marketplace; Google test vs sensitive/restricted). |
| **Agent investigates, human owns gates** | Agent “completes” verification | Privacy policy, demo video, Trust & Safety replies, business verification cannot be automated honestly in this scope. |
| **Shared schema for curated + live** | Separate formats | One product feel; builders can forward either artifact without me narrating. |

### What guides show — and why

Every guide (curated or live) answers the pre-setup questions builders actually need:

| Shown | Why it matters |
| --- | --- |
| **Managed vs custom (first)** | Stops mid-sprint discovery that production needs a custom OAuth app |
| **Difficulty for the recommended production path** | Same provider ≠ same effort; scopes and distribution drive difficulty |
| **Hands-on time vs review wait** | Separates “console afternoon” from “verification quarter” |
| **Path forks** | Names which track you’re on (test / distributed / marketplace / verified) |
| **Requirements + gotchas** | Artifacts (privacy URL, demo) and footguns (`redirect_uri_mismatch`, Slack non-distributed) |
| **Ordered steps → Composio auth config** | Provider registration is useless without wiring credentials into Composio |
| **Agent can / human must** | Sets expectations for what automation can prepare vs what the builder owns |
| **Blockers + unblock** | What to do when stuck — not only the happy path |
| **Sources with verified / inferred / unknown** | Honest evidence bar; no fake approval SLAs |

### Primary research — sources and insights

**Sources I used**

- Composio docs (managed auth directory, managed vs custom, custom auth configs)
- Provider docs and review guides (Google verification FAQ / sensitive scopes; Slack distribution vs Marketplace review; GitHub OAuth App vs GitHub App)
- Adjacent platform pattern (Nango: pre-approved apps for testing, own app before go-live)
- Community / field evidence: Google verification stuck threads and writeups (weeks–months), HN threads on Meta/Google review pain, Slack `invalid_team_for_non_distributed_app` writeups, Reddit API approval friction

**Insights that shaped the product**

1. **Unpredictable calendar time** is the top pain — official ranges understate real waits; surface active effort *and* wait, with path context.
2. **“Do I need my own OAuth app?”** stays unclear until late — managed unblocks prototypes; production branding/scopes/quota quietly force custom. Lead every guide with that decision.
3. **Scope / app-type maze** drives difficulty more than “OAuth” itself — sample apps must show different drivers (GitHub easy self-serve → Gmail verification hell), not four clones of “create client ID.”
4. **Human-only artifacts and review loops** are common blockers — every guide needs an agent vs human split.
5. **Exact-match config footguns** burn hours even when calendar risk is low — gotchas and checklists still belong next to time estimates.

---

## Limitations

Experience-scoped only:

- **Not a full library** — four curated apps demonstrate variety; other apps rely on live generation.
- **Public evidence only** — no logged-in provider portals, no real verification submissions, no guaranteed approval timelines.
- **Live guides are session artifacts** — copy Markdown to share; no durable per-generation URLs.
- **Thin docs → honest uncertainty** — the agent marks `inferred` / `unknown` and tells you what to verify yourself; quality tracks how clear the provider’s public docs are.
- **Managed-auth hints are directory-level** — appearance on Composio’s managed list is a starting signal, not a substitute for confirming in your Composio project.

---

## Project layout

| Path | Role |
| --- | --- |
| `src/lib/guides/` | Schema, curated data, Markdown export |
| `src/lib/agent/` | OpenRouter client + investigation agent |
| `src/app/api/generate/` | Live generation API |
| `src/app/guides/[slug]/` | Curated guide pages |
| `src/app/generate/` | Live generate + result |
| `NOTES.md` | Full research / decision log (phases 0–3) |
| `ASSIGNMENT.md` | Original brief |

---

## Credentials

Do **not** commit `.env.local` or paste keys into the repo or submission form. The deployed demo uses the key in **Vercel project env**. Local clones: `.env.example` → `.env.local` with your own OpenRouter key.
