# OAuth App Readiness (Composio take-home)

A small product for **agent / integration builders** who need end users to connect apps via Composio. It answers the hard part before launch: *Do I stay on Composio’s managed OAuth app, or register a custom OAuth app with the provider — and how long will that take?*

**Live demo:** _add Vercel URL after deploy_  
**Repo:** _filled after push_

---

## What you can try

1. **Home** (`/`) — Toolkits-style entry; open **OAuth Guidance**
2. **Curated guides** (different difficulty):
   - [GitHub](/guides/github) — easy self-serve custom OAuth
   - [Notion](/guides/notion) — easy–medium console setup
   - [Slack](/guides/slack) — path forks (distribution vs Marketplace)
   - [Gmail](/guides/gmail) — hard Google verification / calendar wait
3. **Live generate** (`/generate`) — submit any app name/website; an agent researches public docs (OpenRouter web search + page fetch) and returns a shareable guide matching the same schema. Copy Markdown from the result page.

Curated guides work without an API key. Live generation needs `OPENROUTER_API_KEY` on the server (set in Vercel for the demo; never committed).

---

## Local setup

```bash
npm install
cp .env.example .env.local
# Add OPENROUTER_API_KEY=… from https://openrouter.ai/keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | For `/generate` | Server-only; set in `.env.local` or Vercel |
| `OPENROUTER_MODEL` | No | Default `openai/gpt-4o-mini` |
| `OPENROUTER_WEB_SEARCH_ENGINE` | No | e.g. `exa`, `native` (plugin); omit for OpenRouter default |
| `OPENROUTER_WEB_SEARCH_MAX_RESULTS` | No | Default `5` |

```bash
npm run build   # production check
```

---

## Key decisions

**Focused slice.** Not 100 guides. Four curated apps that span easy → hard, plus live generation for everything else. Decision-first guides (managed vs custom OAuth) beat click-only tutorials for the real pain: time uncertainty and late discovery that BYO is required.

**Shared guide schema.** Curated and live guides use the same shape: managed vs custom, difficulty, hands-on time vs review wait, path forks, requirements/gotchas/steps, agent vs human, blockers, sources with `verified` / `inferred` / `unknown`.

**Composio product language.** “Managed OAuth app” vs “custom OAuth app” (credentials wired into a Composio auth config). Always surface the Composio callback URL when discussing redirects.

**Stack.** Next.js App Router + shadcn/ui on Vercel. AI SDK + OpenRouter for the agent. **No database** — curated guides are static TypeScript; live results live in the session (copy Markdown to share). Keeps the take-home honest for a 6–8h budget.

**Agent design.** Two phases: (1) research with OpenRouter web plugin + `fetch_url` + Composio managed-auth hint; (2) structured guide output. Split on purpose — OpenRouter + AI SDK break when tools and strict JSON schema run in the same loop. The agent does **not** create provider accounts or submit verifications.

**Evidence bar.** No guaranteed approval SLAs. Thin evidence → `unknown`/`inferred` and “what to check yourself.” Spot-check curated + live guides against official docs where practical.

---

## Limitations

- Not a full 100-app library; live gen quality depends on public docs and model judgment.
- No logged-in portal automation; no real provider verification submissions.
- Live guides are not durable share URLs (no DB/Blob persistence).
- OpenRouter usage (model + web search) is billed to whoever hosts the key.
- Research log / tool activity is primarily server-side (`[investigate]` in the host logs); the result UI focuses on the guide itself.

---

## Project layout

| Path | Role |
| --- | --- |
| `src/lib/guides/` | Schema, curated data, Markdown export |
| `src/lib/agent/` | OpenRouter client + investigation agent |
| `src/app/api/generate/` | Live generation API |
| `src/app/guides/[slug]/` | Curated guide pages |
| `src/app/generate/` | Live generate + result |
| `NOTES.md` | Research / decision log (working notes) |
| `ASSIGNMENT.md` | Original brief |

---

## Credentials

Do **not** commit `.env.local` or paste keys into the repo, README, or submission form. For reviewers: the deployed demo should have the key in **Vercel project env** so live generate works without setup. Local clones use their own OpenRouter key via `.env.example` → `.env.local`.
