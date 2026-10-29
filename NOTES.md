# Notes — Composio APM Take-Home

Working doc for research, decisions, and bottlenecks. Submission narrative goes in `README.md` only at the end.

---

## Phase 0 — Problem grounding

**Status:** complete — awaiting approval before Phase 1  
**Sources:** [Managed OAuth apps](https://docs.composio.dev/toolkits/managed-auth), [Managed vs custom auth](https://docs.composio.dev/docs/authentication/custom-app-vs-managed-app), [Custom auth configs](https://docs.composio.dev/docs/auth-configuration/custom-auth-configs)

### Actors


| Actor                         | Role                                                                                                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Agent builder / developer** | Builds an AI agent that needs toolkits (Gmail, Slack, etc.). Owns Composio integration, auth config choice, and (when needed) provider OAuth app registration. |
| **End user**                  | Connects their account via Connect Link / OAuth consent so the agent can act on their behalf.                                                                  |
| **Provider**                  | Google, Slack, GitHub, etc. — registers OAuth apps, issues client ID/secret, enforces scopes, and may require app review/verification before broad use.        |
| **Composio**                  | Tool router / auth layer. Can supply a **managed** OAuth app, or accept the developer’s **custom** OAuth credentials via an auth config.                       |




### Three layers people confuse

1. **End-user connection** — user clicks connect, consents, Composio stores/refreshes tokens. Happens in both managed and custom paths.
2. **Provider OAuth app** — the app registration at the provider (client ID/secret, redirect URI, scopes, branding, verification status). Either Composio’s or the developer’s.
3. **Composio auth config** — tells Composio which credentials/scheme to use for a toolkit in a session. Managed = defaults; custom = developer’s client ID/secret (or other creds) wired in.

The assignment is about layer 2 (and the path into layer 3 when BYO): *create the provider OAuth app and get it ready/approved* — not about inventing the end-user Connect Link UX.

### Managed vs BYO (from Composio docs)

**Managed (default when available)**  

- Composio registers and maintains the OAuth app, credentials, redirect URI.  
- Developer skips provider registration; users still authorize via Connect Link.  
- Consent screen often shows **“Composio wants to access…”** (OK for prototypes/internal; weak for production branding).  
- Shared quota; default scopes; managed auth has constraints (e.g. 15‑min minimum polling on triggers).  
- Directory today: **~124** toolkits with Composio-managed OAuth available.

**Bring your own / custom auth config**  
Required or strongly recommended when:

- Toolkit has **no** managed OAuth (`composio_managed_auth_schemes` lacks the OAuth method) — directory lists **~258** “BYO OAuth app” toolkits.
- Production branding (users should see *your* app name).
- Custom / extra scopes beyond Composio defaults.
- Dedicated rate-limit quota.
- Faster polling than managed allows.
- Custom instance / subdomain (e.g. private Salesforce).
- Enterprise wants end-to-end branding.

Composio’s own docs call out the tension explicitly: *own developer app is recommended for production, but “getting OAuth approvals takes time, so Composio provides a default developer app.”*

**BYO setup shape (OAuth2):** register app at provider → set redirect URI to Composio callback (e.g. `https://backend.composio.dev/api/v3/toolkits/auth/callback`) → put client ID/secret into a custom auth config → pass `auth_config_id` into the session. Mix per toolkit is allowed (BYO for Slack/Google, managed for the rest).

### What “approval” usually means

Not one thing — depends on the provider:

- **Self-serve / instant:** create app in console, copy credentials, works in test or for limited users (e.g. many GitHub OAuth apps; Google in Testing with test users).
- **Verification / review:** publish for production users, sensitive/restricted scopes, brand review, security questionnaires — days to weeks (classic Google verification, Slack distribution, Meta, etc.).
- **Hard gates:** business verification, partner programs, invite-only APIs — can block launch entirely.

Developers struggle most with *not knowing which bucket they’re in* until mid-setup.

### Product implications (for later phases — not decisions yet)

1. **Time uncertainty is the core job** — “Will this take an hour or three weeks?” matters as much as step-by-step clicks.
2. **Human-only steps are common** — legal entity, privacy policy URL, demo video, admin consent; agents can research and draft, not always submit/approve.
3. **Evidence gaps are product features** — guides must separate verified (docs/tried) vs inferred vs unknown; assignment grades honesty.
4. **Two entry triggers for BYO** — (a) toolkit has no managed app, (b) managed exists but production needs (branding/scopes/quota) force a switch. Guidance should cover both.
5. **Shareable artifact** — developers email/Slack “what do we need for OAuth?”; a guide they can forward without us narrating fits Composio’s integrations motion.



### Phase 0 exit check

- [x] Shared vocabulary: actors + three layers  
- [x] When BYO is required vs optional  
- [x] What approval can mean  
- [x] Implications noted (no product decisions locked)

**Phase 0 approved** — Phase 1 started.

---



## Phase 1 — Developer / community pain research

**Status:** complete — awaiting approval before Phase 2  
**Time box:** ~1.5h (kept focused; not exhaustive)  
**Lanes covered:** provider OAuth friction (Google/Slack/Meta/Reddit/GitHub), agent-builder platforms (Composio + Nango parallels), HN/forum/blog evidence

### Ranked pain themes (for agent / integration builders)

**1. Unpredictable time-to-ready (severity + frequency: highest)**  
Official estimates often understate real waits; status is opaque; launch planning breaks.

- Google: brand ~2–3 days, sensitive scopes ~10 business days, restricted + security assessment ~6 weeks ([Google FAQ](https://support.google.com/cloud/answer/13463817)); community reports **months**, stuck queues, missing Trust & Safety email ([12 weeks stuck](https://discuss.google.dev/t/oauth-verification-stuck-for-12-weeks/391690), [~3 months](https://thomasstep.com/blog/google-oauth-verification-experience), [verification hell](https://zencapital.substack.com/p/two-months-in-google-oauth-verification), [HN](https://news.ycombinator.com/item?id=47846665)).
- Slack: **public distribution** can be instant (no Marketplace review) ([Nango writeup](https://nango.dev/blog/fix-slack-oauth-error-invalid-team-for-non-distributed-app/), [Slack docs](https://docs.slack.dev/app-management/distribution/)); **Marketplace** preliminary ≤10 business days + functional ≤**10 weeks** ([review guide](https://docs.slack.dev/slack-marketplace/slack-marketplace-review-guide)). Developers confuse these two paths.
- Meta / Instagram: multi-stage verification; months of resubmits; lockouts after N attempts ([Ask HN](https://news.ycombinator.com/item?id=43895515)).
- Reddit: self-serve API keys tightened; web-app approval wants privacy policy, demo, rate-limit story ([r/redditdev](https://www.reddit.com/r/redditdev/comments/1ptuyr8/has_anyone_successfully_received_web_app_approval/)).

*Implication for product:* surface **active time vs calendar wait**, and which path the developer is actually on (test / distributed / marketplace / verified).

**2. “Do I even need my own OAuth app?” is unclear until late**  
Managed/shared apps unblock prototypes; production quietly forces BYO.

- Composio: managed for ~124 toolkits; BYO for ~258; own app recommended for production branding/scopes/quota; docs admit approvals take time ([managed vs custom](https://docs.composio.dev/docs/authentication/custom-app-vs-managed-app), [custom auth](https://docs.composio.dev/docs/auth-configuration/custom-auth-configs)).
- Nango: same pattern — pre-approved apps for testing; recommend own app before go-live for white-label, scopes, callback, portability, revocation risk ([Nango auth guide](https://nango.dev/docs/guides/auth/auth-guide)). Case studies cite consent-screen branding as a trust issue ([Index](https://nango.dev/case-studies/index/)).

*Implication:* guides should start with **decision: stay managed vs start BYO now**, not only click-paths.

**3. Scope / app-type maze decides difficulty more than “OAuth” itself**  
Same provider, wildly different effort depending on scopes and product surface.

- Google: non-sensitive vs sensitive vs restricted (+ paid security assessment for some Gmail/restricted cases) ([sensitive scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification); HN on Gmail audits).
- Slack: single-workspace install vs Activate Public Distribution vs Marketplace listing.
- GitHub: classic OAuth App (simpler registration) vs GitHub App (preferred, more knobs) ([differences](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps)).
- Reddit: wrong app category / vague use case → rejection.

*Implication:* sample apps in the take-home must show **different difficulty drivers**, not three clones of “create client ID.”

**4. Human-only artifacts and review feedback loops**  
Blockers that agents cannot click through: privacy policy URL, homepage, demo video showing client ID, Limited Use disclosure, consistent branding, business entity, responding to reviewers who may be slow/inconsistent.

Evidence: Thomas Step’s multi-round Google feedback (privacy, branding, demo video); Substack on missing rejection emails and justification character limits; Meta contractors rejecting without opening the app.

*Implication:* every guide needs a clear **agent vs human** split and “what to do when blocked.”

**5. Setup footguns that look like “docs unclear” but are exact-match config**  
High frequency, lower calendar risk, still burns hours.

- `redirect_uri_mismatch` — exact scheme/host/path/slash ([SO classic](https://stackoverflow.com/questions/11485271/google-oauth-2-authorization-error-redirect-uri-mismatch); Composio warns callback must match auth config).
- Slack `invalid_team_for_non_distributed_app` until public distribution enabled.
- Localhost vs HTTPS rules; wrong OAuth client type; legacy vs current Composio callback URLs.

*Implication:* actionable checklists still matter; time estimates should separate “console afternoon” from “verification quarter.”

### What developers need *before* they start clicking

1. Am I on managed, BYO-optional, or BYO-mandatory for this toolkit?
2. Rough **active effort** vs **wait calendar** for my likely scopes / distribution path.
3. What will block approval (policy, video, entity, marketplace)?
4. What can I parallelize now (privacy page, domain verify) while waiting?
5. A shareable checklist for teammates / founders (“we need X before launch”).



### Agent vs human (from research)


| Agent can plausibly do                                     | Human must take over                         |
| ---------------------------------------------------------- | -------------------------------------------- |
| Find official docs, console URLs, redirect URI to register | Create provider account / org; accept ToS    |
| Classify difficulty path (test vs verify vs marketplace)   | Record demo video; own legal/privacy pages   |
| Draft step lists, scope justifications, review Q&A         | Submit verification; reply to Trust & Safety |
| Flag mismatches (redirect URI, distribution not on)        | Complete business verification; pay audits   |
| Cite sources + mark uncertainty                            | Decide product scopes / branding tradeoffs   |




### Developer job-to-be-done (one paragraph)

When an agent builder needs users to connect a third-party app (often via Composio-style tooling), they need to **know whether they can ship on a managed OAuth app or must register their own**, and if BYO: **how hard approval will be, how long calendar time vs hands-on work will take, which artifacts and nuances will block them, and which steps an agent can prepare versus which they must personally complete** — so they can plan launch, brief their team, and make progress without discovering weeks-long review mid-sprint.

### Research limits / bottlenecks

- Did not deeply scrape Composio Discord/Slack (no access in this pass); relied on public docs + analogous platforms (Nango).  
- Provider experiences skew toward Google/Meta (loudest pain); quieter providers underrepresented.  
- Some Reddit API process details may have changed recently — treat as “high friction / approval-gated,” verify in later phases if Reddit is a sample app.  
- No product decisions locked in this phase.



### Phase 1 exit check

- [x] 3–5 ranked pains with links  
- [x] Pre-setup needs + agent/human split  
- [x] JTBD paragraph  

**Phase 1 approved** — Phase 2 started.

---



## Phase 2 — Batched decision pack (YOUR APPROVAL GATE)

**Status:** awaiting your approve / revise  
**Rule:** nothing is built until this whole pack is approved. Reply with “approve” or list specific edits.

### D1 — Focused slice

**We build:** a small **OAuth App Readiness** experience for agent builders — lookup a few curated toolkit guides + submit any app name/URL for a **live agent-generated shareable guide** that answers: managed vs BYO, difficulty, active effort vs calendar wait, requirements/gotchas, agent vs human next steps, and evidence confidence.

**Why this slice:** Phase 1’s top pains are time uncertainty, late discovery that BYO is needed, scope/path maze, and human-only blockers. Click-only tutorials don’t fix that; a decision-first readiness guide does. Matches the assignment without boiling the ocean.

**Out of scope for this take-home:**

- Full 100-guide library (we ship 4 curated + live gen for the rest)
- Completing provider verifications / paid audits / production Composio accounts
- End-user Connect Link UX redesign
- Auth for our own product users, billing, admin
- Perfect design system / crawling every provider portal as a logged-in user



### D2 — Primary user

**Persona:** agent / integration developer using Composio (or similar) who needs end users to connect apps and is deciding whether to stay on managed OAuth or stand up a BYO provider OAuth app for launch/production.

**Not primary:** end users clicking Connect; Composio internal ops; pure API-key toolkits with no OAuth.

### D3 — Guide schema (every guide, curated or live)

Fixed fields — UI and agent output must fill these:


| Field                  | What it answers                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------ |
| **Identity**           | App/toolkit name, website, Composio slug if known                                    |
| **Managed vs BYO**     | Can stay on Composio managed? When to start BYO? (decision-first)                    |
| **Difficulty**         | Easy / Medium / Hard (for the *recommended production BYO path*)                     |
| **Active effort**      | Hands-on time estimate (e.g. 30–90 min console work)                                 |
| **Calendar wait**      | Approval/review wait if any (e.g. none / days / weeks); call out path forks          |
| **Path forks**         | e.g. Slack distribute vs Marketplace; Google test vs sensitive vs restricted         |
| **Requirements**       | Redirect URI, scopes notes, privacy policy, branding, demo video, etc.               |
| **Gotchas**            | Footguns (redirect match, distribution toggle, scope tiers)                          |
| **Steps**              | Ordered next actions for BYO setup → wire into Composio auth config                  |
| **Agent vs human**     | Checklist split: what an agent can prepare vs what you must do                       |
| **Blockers & unblock** | Likely stops + what to do when stuck                                                 |
| **Evidence**           | Sources + confidence: `verified` / `inferred` / `unknown` per claim where it matters |
| **Share**              | Stable URL (curated) or exportable/shareable page (live)                             |




### D4 — Sample apps (4, deliberately varied)


| App                | Why it demonstrates variety                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **GitHub**         | Easy self-serve OAuth app; minutes; managed available; BYO mainly for branding/control                                                      |
| **Notion**         | Easy–medium console setup; managed available; clear BYO-for-branding story; few approval gates                                              |
| **Slack**          | Medium *path confusion*: public distribution (often instant) vs Marketplace (weeks); classic footgun `invalid_team_for_non_distributed_app` |
| **Gmail (Google)** | Hard: sensitive/restricted scope verification, privacy/demo artifacts, weeks–months calendar risk — top Phase 1 pain                        |


These four map Easy → Hard and cover managed-available + production-BYO pressure. Live gen covers apps outside this set (including BYO-mandatory toolkits).

### D5 — Live generation behavior

1. User submits **app name and/or website**.
2. Agent investigates with tools (web fetch/search of official docs, Composio managed-auth page when relevant).
3. Agent **attempts as much as practical without credentials**: find developer portal, OAuth docs, redirect rules, review/verification pages; does **not** create paid accounts or submit real verifications.
4. Output is a guide matching **D3 schema**, streamed into a shareable results page.
5. Every non-trivial claim tagged or summarized as **verified** (linked primary source), **inferred** (reasonable from docs/community), or **unknown** (couldn’t confirm).
6. If evidence is thin, agent still returns a useful guide but **leads with uncertainty** and “what to verify yourself.”
7. Same schema as curated guides so library + live feel like one product.



### D6 — Evidence bar

- **Curated guides:** written from official docs + Phase 1 sources; Phase 4 spot-check at least **2 curated + 1 live** against live docs; log corrections in NOTES.  
- **We refuse to claim:** exact approval SLAs as guarantees; “you will be approved”; anything requiring logged-in portal state we didn’t see.  
- **We will claim:** documented paths, published time *ranges* with caveat, common footguns with sources, Composio managed vs BYO when docs/API say so.  
- Live guides always show sources list; curated guides show last-reviewed note.



### D7 — Implementation defaults (time box)

**Stack (updated):** Vercel-native + shadcn/ui. **No database.**


| Choice       | Default                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------- |
| App          | **Next.js** (App Router) hosted on **Vercel**                                                                       |
| UI           | **shadcn/ui** + Tailwind (clean, shareable guide pages; not over-designed)                                          |
| Curated data | Static JSON (or MD) in the repo — 4 apps, D3-shaped; routes like `/guides/github`                                   |
| Live agent   | API route + **AI SDK** via **OpenRouter** (`@openrouter/ai-sdk-provider`); tool-calling for fetch/search           |
| Persistence  | **No DB.** Curated = files. Live = generate and show on the results page; “share” = copy Markdown / print-friendly page (optional: client can re-run with same input). Avoids Neon/Postgres/KV setup in the time box. |
| UX           | Home: library browse + “generate for any app”; guide page: schema sections; generation progress visible             |
| Secrets      | `.env.local` / Vercel env only — never commit keys                                                                  |
| README       | Filled in Phase 4 with setup, decisions, limitations, deploy link                                                   |


**Why no DB:** curated guides don’t need one; live guides for the take-home don’t need durable multi-user storage. Persistent shareable URLs for every live generation would need Blob/DB — out of scope unless you explicitly want that later.

Stack is part of this pack — reject or swap in the same approval reply if you want a DB after all.

### How the pack addresses Phase 1 pains


| Pain                 | How the product answers                    |
| -------------------- | ------------------------------------------ |
| Unpredictable time   | Active effort + calendar wait + path forks |
| Managed vs BYO late  | Decision block first on every guide        |
| Scope/app-type maze  | Path forks + sample apps across tiers      |
| Human-only artifacts | Agent vs human checklist                   |
| Config footguns      | Gotchas + ordered steps                    |




### Approval checklist (reply to this)

- [x] D1 slice  
- [x] D2 persona  
- [x] D3 schema  
- [x] D4 sample apps (GitHub, Notion, Slack, Gmail)  
- [x] D5 live agent behavior  
- [x] D6 evidence bar  
- [x] D7 stack defaults (Vercel + shadcn, no DB)  

**Phase 2 approved** — Phase 3 started.

---

## Phase 3 — Build (working slice)

**Status:** complete — awaiting approval before Phase 4  
**Stack:** Next.js App Router + shadcn/ui + AI SDK + OpenRouter + Vercel host; no DB

### What shipped

| Surface | Path |
| --- | --- |
| Toolkits entry (docs replica + 4th tile) | `/` |
| OAuth Readiness (from OAuth Guidance tile) | `/oauth` |
| Guide pages | `/guides/github`, `/guides/notion`, `/guides/slack`, `/guides/gmail` |
| Live generate | `/generate` → `/generate/result` (sessionStorage share/copy Markdown) |
| Agent API | `POST /api/generate` |

**Product placement:** Journey starts on a Toolkits-style surface (like docs.composio.dev/toolkits). Tiles 1–3 are placeholders; **OAuth Guidance** is the live entry into the take-home.

**Copy tone:** Plain language for AI-native builders (not only seasoned eng). UI labels avoid unexplained jargon (e.g. “Your hands-on time” not “Active effort”; “Register your own” not “BYO”). Live agent prompt matches.

### Implementation notes

- Guide schema + curated content: `src/lib/guides/`
- Agent investigation (fetch_url + Composio managed-auth hint tools): `src/lib/agent/investigate.ts`
- Copy Markdown = share without persistence
- Live gen needs `OPENROUTER_API_KEY` in `.env.local` (see `.env.example`); optional `OPENROUTER_MODEL`
- `npm run build` succeeds locally

### Not done yet (Phase 4)

- Spot-check curated + one live guide against sources
- Deploy to Vercel + fill submission `README.md`

**Stop here.** Do not start Phase 4 until Phase 3 is approved.