# Personal restyle: Vitality → mine

## Goal

Re-skin the dashboard from the shipped Vitality look (mint-green glass, cool
near-black backdrop) to a personal palette, while keeping every tile,
animation, and piece of data working exactly as it does today. This is a
pure re-skin: no structural, layout, or data-model changes.

## Decisions

- **Gem avatar** — keep the crystal shape, moods, and animations (`HeroCrystal`
  / `DashboardHeaderGem`) exactly as they behave today. Only its material
  color changes (mint → new accent).
- **Tile art** — keep every tile's illustrations, gradients, and layout.
  Recolor them to the new palette; no simplification, no redesign.
- **Mentor tile** — keep its layout and content structure. Recolor only.
- **Background** — keep the mountain scene + drifting particles
  (`WelcomeBackdrop`). Recolor to the new palette.
- **Mood** — calm / focused.
- **Palette** — Claude-orange accent on a neutral charcoal base (see table below).

## Palette

| Token | Old (mint) | New | Purpose |
|---|---|---|---|
| `--accent` (was `--mint`) | `#6EE7B7` | `#D97757` | primary accent — buttons, highlights, gem, active states |
| `--accent-hover` (was `--mint-hover`) | `#5dd6a6` | `#E8916D` | hover state |
| `--accent-deep` (was `--mint-deep`) | `#1f4d3d` | `#3D2B22` | dark warm partner fill (was dark teal, now dark warm brown) |
| `--accent-glow` (was `--mint-glow`) | `rgba(110,231,183,0.4)` | `rgba(217,119,87,0.4)` | glow / halo / shadow |
| `--accent-ink` (was `--mint-ink`) | `#042a1c` | `#241505` | dark foreground text/icons on an accent fill |
| base background | `#04060a` (cool blue-black) | `#141414` (neutral charcoal) | page backdrop, wherever hardcoded |

Mood: calm/focused — cool-neutral dark base, warm orange as the single clear
accent, no other hue introduced.

## Scope (files touched)

Pure recolor — same set of files, no new files, no deletions, no renames of
components:

- `app/globals.css` — rename the `--mint*` variable family to `--accent*`
  (per table above), update every internal usage, update base background var.
- `app/app/DashboardHeaderGem.tsx`, `app/app/dashboardHeaderGem.module.css`,
  `components/HeroCrystal.tsx` — gem material color only; moods, animation
  timing, and pulse effects (rings/particles/sparkles) untouched.
- `app/icon.tsx`, `app/apple-icon.tsx` — favicon / home-screen icon SVG fills
  (this is the gem mark, so it follows the gem's new color).
- `components/WelcomeBackdrop.tsx`, `components/WelcomeBackdrop.module.css` —
  mountain + particle colors only; scene geometry and motion untouched.
- `app/mentor/MentorPage.tsx` — recolor only, same layout/content.
- `app/app/Dashboard.tsx`, `app/app/DashboardGrid.tsx`,
  `app/app/dashboard.module.css`, `app/app/customizableDashboard.module.css`,
  `components/veeTiles.css`, `components/veeTilesAnim.ts` — any hardcoded
  mint hex swapped to reference the new tokens.
- `tiles-library/*.html` (all 7: brand, finance, fuel, peak, train, vee,
  vitals) — each tile is a self-contained sandboxed document with its own
  local `--brand` (or hardcoded hex); update each tile's local value(s) to
  the new palette. This is the source of truth for tile content.
- `public/tiles/*.html` — mirrored copies of the same 7 files; apply the
  identical change so the two directories stay in sync (this is what
  actually ships to the running dashboard).
- `app/api/mcp/oauth/authorize/route.ts` — the MCP connector's consent
  screen; it's inline-styled to match the dashboard look, so it gets the
  same recolor.
- `app/api/mcp/[transport]/route.ts` — the `/tile`-builder's own tool
  instructions currently say to match "near-black background, mint accent
  #6EE7B7"; update that instruction string to the new palette so any tile
  built after this change already comes out correctly, with no separate
  follow-up needed.

Explicitly **not** touched: `lib/tiles/weights.ts` (goal/weight data),
any `window.Vitality.save/load` data, tile mechanics, `SETUP.md` content
(structure unchanged; it has no hardcoded color styling to update).

## Execution order

1. `app/globals.css` — rename tokens, set new values, update base background.
2. Sweep remaining hardcoded mint hex across gem, icons, backdrop, Mentor
   tile, dashboard components to reference/match the new tokens.
3. `tiles-library/*.html` — update the 7 source tile files.
4. `public/tiles/*.html` — apply the identical update so both directories
   match exactly.
5. `app/api/mcp/[transport]/route.ts` — update the tile-builder instruction
   string.
6. `app/api/mcp/oauth/authorize/route.ts` — recolor the consent screen.
7. Restart dev server; visually verify every tile, the gem (including its
   mood animations), the background, the Mentor tile, and the OAuth consent
   screen in the browser. Confirm no leftover mint anywhere and all existing
   tile data still renders.

## Verification

This is visual-only — no data model or logic changes. Verification is
`npm run dev` + browser inspection of every screen listed above, plus a
grep for the old mint hex values (`#6EE7B7`, `#5dd6a6`, `#1f4d3d`,
`rgba(110,231,183`, `#042a1c`, `#04060a`) to confirm nothing was missed.

## Out of scope

- Any new features, tiles, or data fields.
- Any change to tile mechanics, `/tile`, `/vitality`, `/detonate`, `/sweep`.
- Any change to `SETUP.md` structure or the onboarding flow.
- Any change to non-visual code paths (API logic, MCP auth logic itself,
  only its page's color styling).

## Addendum (confirmed before implementation)

A deeper pass over the codebase turned up real gaps in the file list above,
plus two correctness issues in the execution order. Resolved with the user
before planning:

- **PWA / browser theme color** — `app/manifest.ts` (`background_color`,
  `theme_color`) and `app/layout.tsx` (`themeColor`) hardcode the old base
  background `#04060a`. **In scope**: update to the new charcoal `#141414`.
- **`lib/tiles/dashboardChrome.ts`** — not in the original file list, but it
  hardcodes the mint hex as the default World wallpaper accent
  (`DEFAULT_CHROME.background.accent`), the default gem tint
  (`DEFAULT_CHROME.gem.tint: 'mint'`), and the `backgroundAccent()` fallback
  for gradient/solid modes. It also holds `WALLPAPER_ACCENTS`, a 6-swatch
  color *picker* (Mint, Azure, Ice, Amber, Violet, Rose) a user can choose
  for their own wallpaper. **In scope**: update the three hardcoded defaults
  to the new accent; **remove** the `Mint` entry from `WALLPAPER_ACCENTS`
  (user chose to drop it from the picker entirely, not keep it as an
  option).
- **Logger tile template** — `code/the-living-logger.html` and
  `code/the-living-logger.tile.html` (~2700 lines each) are the `/logger`
  skill's bundled source, not currently installed anywhere on the board (no
  file references them). **In scope** — user chose to recolor now rather
  than wait for install.
- **`tiles-library` vs `public/tiles` are NOT identical for `finance` and
  `fuel`** — `diff` shows both differ from their `tiles-library` source.
  `public/tiles/fuel.html` in particular has its own custom gold/black
  palette (`--gold`, `--gold-cool`, `--gold-deep`, pure black `--bg:#000`)
  from the recent living-stack integration — **zero mint references**, so it
  needs **no changes**. Corrected execution order: recolor each of the 14
  `tiles-library`/`public/tiles` files **independently in place** (apply the
  substitution table to whatever old-palette values exist in that specific
  file); do **not** copy `tiles-library` over `public/tiles` as the original
  step 4 described — that would destroy the fuel/finance feature work
  already live in `public/tiles`.
- **Role-based exception, not a blind hex swap** — in
  `app/api/mcp/oauth/authorize/route.ts:106`, `.allow { color:#04060a }` is
  the *dark text color drawn on top of the accent-filled button*, not the
  page background, even though it happens to reuse the same old hex. It
  maps to the new **accent-ink** (`#241505`), not the new base background
  (`#141414`) — same treatment as `--mint-ink` elsewhere in the app.
- **Do not rename internal identifiers** — `tiles-library/peak.html` /
  `public/tiles/peak.html` use `mint` as an object key in tier-lookup maps
  (`BAND`, `TONE`, `TONE_BG`) and `components/veeTilesAnim.ts` has a local
  `const MINT = '#6EE7B7'`. Per "pure re-skin, no structural changes,"
  update only the **hex values** these hold — leave the key/identifier names
  (`mint`, `MINT`) untouched, since renaming them means updating every call
  site that indexes by that key (a logic change, not a recolor).
- **Multi-color arrays** — `components/veeTilesAnim.ts`'s `COLORS` array has
  6 distinct hues for multi-series charts; only the entry matching the old
  mint hex (`#6EE7B7`) changes. The other 5 are deliberate distinct colors,
  not the accent, and stay as-is.
