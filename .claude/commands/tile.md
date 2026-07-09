---
<<<<<<< HEAD
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
=======
description: Build a self-contained Vitality dashboard tile and drop it into its slot.
---

You are building ONE dashboard tile for a Vitality Base fork.

The argument is the slot name. It must be exactly one of:
`train, fuel, vitals, vee, brand, peak, finance`

If no slot is given, ask which one, then continue.

Build the tile as a single self-contained HTML file and write it to:
`public/tiles/<slot>.html`

Rules (the Sealed Tile Contract):

1. One file. All CSS and JS inline. No external requests, no imports, no CDN links, no fonts
   over the network. The tile runs in a sandboxed iframe with no network, so anything not inline
   will not load.
2. Match the look: pure black background, mint accent `#6EE7B7`, Inter or system font, minimal
   and premium. No emojis in the UI.
3. Save data through the host bridge, never localStorage (localStorage is blocked inside the
   sealed tile). The dashboard provides `window.Vitality` for you:
   - `await window.Vitality.save(data)` to persist (data is JSON; an array of records is the
     natural shape).
   - `const data = await window.Vitality.load()` to read it back (returns `[]` when empty).
   Do not define `window.Vitality` yourself. The dashboard injects it at mount.
4. On load, call `window.Vitality.load()` first and render whatever comes back, so the tile
   restores its state every time it opens.

After writing the file, tell the user to commit and reload the dashboard so the `<slot>` tile
fills.
>>>>>>> ef24a6b088a62207bbd108b48b33f50dba7203bd
