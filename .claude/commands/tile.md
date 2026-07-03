---
description: Build a Vitality dashboard tile and drop it into a slot (public/tiles/<slot>.html)
---

# Build a tile for a slot

You are building ONE dashboard tile for this Vitality base and wiring it into the
exact slot the dashboard reads.

**Argument:** `$ARGUMENTS` is the target slot id — one of:
`train`, `fuel`, `vitals`, `vee`, `brand`, `peak`, `finance`.
If it's empty or not one of those, ask the user which slot, then continue.

## Steps

1. Ask (one short question) what the tile should do, if it isn't already clear from
   the conversation. Keep it to a single focused function (one number, one habit, one
   view) — tiles are small.

2. Write the tile as **one self-contained HTML file** to:

   ```
   public/tiles/<slot>.html
   ```

   Rules for the file:
   - Everything inline — no external CSS, JS, fonts, or network requests. It runs
     sandboxed (`allow-scripts`, no same-origin), so external calls are blocked.
   - Match the Vitality look: near-black background, mint accent `#6EE7B7`, clean
     sans headings, generous spacing, subtle motion.
   - Fill the frame responsively (it opens in a large centred panel).
   - If it needs to remember data, use the host bridge (localStorage under the hood):
     ```js
     await window.Vitality.save(data)        // persist
     const data = await window.Vitality.load() // read back (may be null/[])
     ```

3. Tell the user it's done and how to see it:
   - Locally: reload `http://localhost:3000` and click the **<slot>** tile.
   - Live: commit + push, let Vercel redeploy, then click the tile.

Do NOT touch any other file. One command → one slot file. That's the whole contract
(see `public/tiles/README.md`).
