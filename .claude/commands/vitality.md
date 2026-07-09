---
description: Build a brand-new Vitality dashboard from an empty folder — scaffold, run it locally, then put it live on GitHub + Vercel.
---

You are setting up a **brand-new Vitality dashboard from scratch** for someone who may be a total
beginner. They have opened an empty folder in VS Code and asked you to set it up — by running
`/vitality`, or by pasting these steps into the chat. Your job is to turn that empty folder into a
real, live app that is *theirs*.

Tone: warm, plain-language, ONE step at a time. Explain what each step does in a sentence before you
run it. Never dump jargon. Confirm before anything that touches the internet (pushing to GitHub).

The optional argument is the app/repo name. If none is given, ask for one, and default to
`my-dashboard` if they don't care.

## Hard rule: do NOT improvise the app

Do not hand-write, regenerate, or "build" the dashboard yourself. The scaffold command below pulls
the real, tested Vitality starter — that is what makes it identical and unbreakable for everyone.
Your job is to run the steps, explain them, and handle any snags — not to invent code.

## Step 1 — Scaffold the starter into this folder

Tell them: "Pulling the Vitality starter into your folder — your own copy, not a fork of mine."

```bash
npx --yes degit RowanThistlebrooke/vitality-base . --force
```

This lays down the whole app with **no git history** — a clean, standalone copy they own. (`--force`
is safe here: the folder only contains the command you just pasted.)

## Step 2 — Make the board start empty

A fresh dashboard should boot to a blank "See the vision" poster board — no pre-built tiles. Clear
any starter tiles so every slot starts empty (keep the README and `.gitkeep`):

```bash
find public/tiles -maxdepth 1 -name '*.html' -delete
```

## Step 3 — Install

```bash
npm install
```

Tell them this pulls in the pieces the app needs; it takes a minute. (Requires Node 20+ — if `node
-v` is below 20 or missing, point them to nodejs.org to install the LTS version first.)

## Step 4 — See it live on your own machine

Start it:

```bash
npm run dev
```

Then tell them, in your own words:
- Open **http://localhost:3000** in the browser.
- They'll see **their blank dashboard** — the animated poster board, every tile an empty slot.
- The bottom-left **"See the vision"** button flips to the welcome screen; **"← Back to dashboard"** returns.
- This is running on *their* computer. Nothing is online yet — that's the next step.

This is the moment to let land: they typed one thing and an app appeared in their folder.

## Step 5 — Put it on GitHub (ask first, then do it for them)

Only after they've seen it working, offer: "Want me to put this online so it's a real website? I'll do
the git for you." There is exactly ONE thing only they can do — a one-time browser sign-in. Everything
else, you do.

1. **Check the GitHub CLI is installed.** Run `gh --version`. If it's missing, help them install it,
   then continue:
   - macOS: `brew install gh` (no Homebrew? point them to cli.github.com).
   - Windows: `winget install --id GitHub.cli` (or cli.github.com).
2. **Sign in — their one step.** Run `gh auth status`. If they're not logged in (or logged in as the
   wrong account), run `gh auth login` → **GitHub.com → HTTPS → Login with a web browser**, and tell
   them to finish the sign-in in the browser **as the account that should own this dashboard**. Wait for
   it, then re-check `gh auth status`. (You can't complete a browser login for them — that's the one
   handshake that's theirs.)
3. **Save a first version and create the repo — you run this part:**
   ```bash
   git init -b main
   git add -A
   git commit -m "chore: my Vitality dashboard from the starter"
   gh repo create <name> --public --source=. --remote=origin --push
   ```
   Use their app name for `<name>`.

**If the push still fails with a red 403 / Permission denied**, the computer is signed into the wrong
GitHub. Two-minute fix: `gh auth status` to see who they are → `gh auth logout` (or clear it: Mac
**Keychain Access** → search "github" → delete; Windows **Credential Manager → github.com → Remove**) →
`gh auth login` as the right account → `git remote -v` should point at *their* repo → push again.
Everyone hits this once.

## Step 6 — Deploy, then memory (account steps stay in the browser, on purpose)

These two live in their own web consoles. The one-time sign-ins and "create project" clicks are theirs
to make — you can't (and shouldn't) automate them, because a failed CLI step here is unrecoverable for a
beginner. Guide them clearly; do the parts you safely can.

1. **Deploy — keep this in the Vercel dashboard, don't CLI it.** Send them to **vercel.com → Add New →
   Project**, import the repo they just pushed, click **Deploy**. That one click also wires up
   "**push → auto-deploys**," which a CLI deploy would NOT — so this stays manual on purpose. In a minute
   they get a live `…vercel.app` URL. It'll look empty — correct, it has no memory yet.
2. **Give it memory (optional but recommended).** At supabase.com they create a free project (their
   sign-in, their click). Then the SQL — offer to run it *for* them:
   - **The assist:** if `psql` is available (`psql --version`) and they paste their Supabase
     **connection string** (Supabase → Project Settings → Database → Connection string → URI), run it
     for them: `psql "<connection-string>" -f supabase/sync.sql`, then confirm it succeeded.
   - **The safe default:** otherwise open `supabase/sync.sql`, have them copy it into Supabase
     **SQL Editor → Run** — success reads "Success. No rows returned."
   - Then they add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase → Settings →
     API) to Vercel's env vars and redeploy. Double-check those two names are **exact** — a typo means
     nothing saves. Full walkthrough is in their `README.md`.

## Then

Point them at what's next: build their first tile with `/tile <slot>` (slots: `train, fuel, vitals,
vee, brand, peak, finance`), or follow a Patreon episode command. The loop from here is: **think it →
tell Claude → push → watch it go live.**
