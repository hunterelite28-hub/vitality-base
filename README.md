# Vitality — Base Dashboard

Your own personal dashboard, forkable in a couple of minutes. It's the exact
Vitality home screen: an animated poster grid over a living backdrop. Every tile is
an empty **slot** — you fill each one by following a step-by-step build (on Patreon)
or by building your own.

**No backend. No login. No accounts.** Fork it, deploy it, done.

---

## Deploy in 2 minutes

1. **Use this template** (green button on GitHub) → creates your own repo.
2. **Deploy to Vercel** — import the repo, click Deploy. There are **no environment
   variables** to set.

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=REPLACE_WITH_YOUR_GITHUB_REPO_URL)

That's it — your dashboard is live.

### Make it yours

Edit one line in [`content/site.ts`](content/site.ts) to put your name in the
greeting:

```ts
export const site = { name: 'Rowan' }
```

## Run it locally

```bash
git clone <your-fork-url>
cd vitality-base
npm install
npm run dev        # → http://localhost:3000
```

Requires Node 20+ (see `.nvmrc`).

---

## Filling the tiles

Click any tile — it opens a panel telling you how to build it. Each tile is a slot
that fills when a file exists at `public/tiles/<slot>.html`. Two ways to fill one:

- **Follow a build.** Each Patreon episode ships a slash command (e.g. `/logger`).
  Drop it into `.claude/commands/`, run it in Claude Code, and it writes the tile
  straight into the right slot. Commit + redeploy and it appears.
- **Build your own.** Run [`/tile <slot>`](.claude/commands/tile.md) in Claude Code
  (or ask it to "build a `<slot>` tile and save it to `public/tiles/<slot>.html`").

A tile is one self-contained HTML file. It can save its own data (no backend) via
`window.Vitality.save()/load()`. Full contract: [`public/tiles/README.md`](public/tiles/README.md).

The slots: `train`, `fuel`, `vitals`, `vee`, `brand`, `peak`, `finance`.

---

## Tech

Next.js 14 (App Router) · vanilla CSS · Three.js for the header gem · deployed static
on Vercel. No database, no auth — a tile's data lives in your browser.
