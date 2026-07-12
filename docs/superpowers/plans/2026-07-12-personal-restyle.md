# Personal Restyle (Vitality mint → orange/charcoal) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the dashboard from Vitality's mint-on-near-black look to a personal Claude-orange-on-charcoal look, touching only colors — every tile, animation, gem mood, and piece of stored data keeps working exactly as it does today.

**Architecture:** This is a pure value substitution across ~30 files: CSS custom properties, inline hex literals in TSX/CSS/HTML, and two hardcoded THREE.Color material constants in the 3D gem. There is no unit-testable logic here — "test" for each task means a scoped `grep` proving zero old-palette values remain in that task's files, plus a final full-repo sweep and browser check. No structural, layout, or data-model changes anywhere.

**Tech Stack:** Next.js (App Router), CSS Modules, Three.js (HeroCrystal gem), plain self-contained HTML tiles.

## Global Constraints

- **Master substitution table** (exact hex/rgba matches only — case-insensitive on hex digits, preserve existing alpha values and whitespace style of the surrounding code):

  | Old | New | Role |
  |---|---|---|
  | `#6EE7B7` / `#6ee7b7` | `#D97757` / `#d97757` | primary accent |
  | `#5dd6a6` | `#E8916D` | accent hover |
  | `#1f4d3d` | `#3D2B22` | accent-deep (dark warm fill) |
  | `rgba(110, 231, 183, X)` / `rgba(110,231,183,X)` | `rgba(217, 119, 87, X)` / `rgba(217,119,87,X)` | accent glow/halo (keep alpha `X` and spacing style unchanged) |
  | `#042a1c` | `#241505` | accent-ink (dark text/icon color drawn on an accent fill) |
  | `#04060a` | `#141414` | base background — **only when the role is page/backdrop background**; see the OAuth exception below when the same old hex is used as ink instead |

- **Do not rename internal identifiers.** Object keys and local constants named `mint`/`MINT` (e.g., `peak.html`'s `BAND`/`TONE`/`TONE_BG` tier maps, `veeTilesAnim.ts`'s `const MINT`) keep their names — only the hex values they hold change. Renaming would require updating every call site that indexes by that key, which is a logic change, not a recolor.
- **Do not touch multi-hue arrays' other entries.** `veeTilesAnim.ts`'s `COLORS` array has 6 distinct hues for multi-series rendering — only the one entry equal to the old accent changes.
- **Do not touch `lib/tiles/weights.ts`.** Its `accent: '#...'` fields are per-goal badge colors (data), not the app theme, even where one coincidentally equals the old mint hex.
- **`tiles-library/*.html` and `public/tiles/*.html` are edited independently, file by file** — never copy one directory over the other. `finance.html` and `fuel.html` have diverged (real feature work already live in `public/tiles`); `public/tiles/fuel.html` already has its own gold/black palette with zero mint references and needs **no edits**.
- Every step's file paths are exact; every replacement is a literal string of the file's own current content — the code blocks below are ready to feed straight into an editor.

---

### Task 1: Rename and recolor the design tokens (`app/globals.css`)

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Produces: the CSS custom properties `--accent`, `--accent-hover`, `--accent-deep`, `--accent-glow`, `--accent-ink` (renamed from `--mint`, `--mint-hover`, `--mint-deep`, `--mint-glow`, `--mint-ink`). Every later task that references `var(--mint...)` must switch to `var(--accent...)`.

- [ ] **Step 1: Rename and recolor the token block (lines 8–12)**

Old:
```css
  --mint: #6EE7B7;
  --mint-hover: #5dd6a6;
  --mint-deep: #1f4d3d;       /* dark teal partner to mint */
  --mint-glow: rgba(110, 231, 183, 0.4);
  --mint-ink: #042a1c;        /* dark foreground for text/icons on a mint fill */
```
New:
```css
  --accent: #D97757;
  --accent-hover: #E8916D;
  --accent-deep: #3D2B22;     /* dark warm partner to accent */
  --accent-glow: rgba(217, 119, 87, 0.4);
  --accent-ink: #241505;      /* dark foreground for text/icons on an accent fill */
```

- [ ] **Step 2: Update every remaining `var(--mint...)` / literal usage in this file**

Lines 91, 100, 225, 305, 310, 376, 383, 388, 452, 471 all reference `var(--mint)` or `var(--mint-hover)` — replace with `var(--accent)` / `var(--accent-hover)` respectively. Lines 377 (`rgba(110, 231, 183, 0.04)`) and 472 (`rgba(110, 231, 183, 0.9)`) — apply the master table (→ `rgba(217, 119, 87, 0.04)`, `rgba(217, 119, 87, 0.9)`). Update the comment on line 90 ("brand mint" → "brand accent").

- [ ] **Step 3: Recolor the base background (line 76, comment on line 74)**

Old: `background: #04060a;` → New: `background: #141414;`
Update the comment on line 74 referencing `#04060a` to read `#141414`.

- [ ] **Step 4: Verify**

Run: `grep -n "mint\|#6EE7B7\|#6ee7b7\|#5dd6a6\|#1f4d3d\|#042a1c\|#04060a" app/globals.css`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "Rename mint tokens to accent and recolor to orange/charcoal"
```

---

### Task 2: Cascade the token rename into consuming components

**Files:**
- Modify: `app/app/dashboardHeaderGem.module.css`
- Modify: `app/app/Dashboard.tsx`
- Modify: `app/app/DashboardGrid.tsx` (color-only lines; the prompt string is handled in Task 9)
- Modify: `app/app/dashboard.module.css`
- Modify: `app/app/customizableDashboard.module.css`
- Modify: `components/WelcomeBackdrop.module.css`

**Interfaces:**
- Consumes: `--accent`, `--accent-ink` from Task 1.

- [ ] **Step 1: `app/app/dashboardHeaderGem.module.css`**

Replace every `rgba(110, 231, 183, X)` / `rgba(110,231,183,X)` with `rgba(217, 119, 87, X)` / `rgba(217,119,87,X)` (preserve alpha) on lines 23, 24, 27, 28, 35, 36, 52, 78, 79, 104, 124 (two occurrences), 125, 148, 168 (two occurrences), 188 (two occurrences), 189 (two occurrences). Line 103: `background: var(--mint, #6EE7B7);` → `background: var(--accent, #D97757);`

- [ ] **Step 2: `app/app/Dashboard.tsx`**

- Line 169: `color: 'var(--mint, #6EE7B7)'` → `color: 'var(--accent, #D97757)'`
- Lines 214, 359: `background: 'var(--mint, #6EE7B7)',` → `background: 'var(--accent, #D97757)',`
- Lines 215, 360: `color: 'var(--mint-ink, #042a1c)',` → `color: 'var(--accent-ink, #241505)',`
- Line 406: `const wallAccent = goalAccent ?? (chrome ? backgroundAccent(chrome.background) : '#6EE7B7')` → `... : '#D97757')`

- [ ] **Step 3: `app/app/DashboardGrid.tsx`** (color literals only — line 265's prompt string is Task 9)

- Line 178: `color={accent ?? '#6EE7B7'}` → `color={accent ?? '#D97757'}`
- Lines 338, 407: `color: 'var(--mint-ink, #042a1c)',` → `color: 'var(--accent-ink, #241505)',`
- Line 454: `color: '#6EE7B7'` → `color: '#D97757'`
- Line 462: `background: '#6EE7B7',` → `background: '#D97757',`
- Line 505: `color: '#6EE7B7'` → `color: '#D97757'`
- Line 510: `color: '#6EE7B7' }` → `color: '#D97757' }`
- Line 518: `background: '#6EE7B7',` → `background: '#D97757',`
- Lines 745, 757, 840, 960: `'var(--mint, #6EE7B7)'` → `'var(--accent, #D97757)'`
- Line 746: `` `0 0 34px ${goal?.accent ?? '#6EE7B7'}44` `` → `` `0 0 34px ${goal?.accent ?? '#D97757'}44` ``
- Line 777: `const gA = g.accent ?? '#6EE7B7'` → `const gA = g.accent ?? '#D97757'`
- Line 830: `'var(--mint, #6EE7B7)'` → `'var(--accent, #D97757)'`
- Line 856: `editing ? 'var(--mint-ink, #042a1c)' : 'var(--muted)',` → `editing ? 'var(--accent-ink, #241505)' : 'var(--muted)',`
- Lines 892, 938: `color: 'rgba(110,231,183,.45)',` → `color: 'rgba(217,119,87,.45)',`
- Line 958: `border: '1px dashed rgba(110,231,183,.35)',` → `border: '1px dashed rgba(217,119,87,.35)',`

- [ ] **Step 4: `app/app/dashboard.module.css`**

Replace every `rgba(110, 231, 183, X)` / `rgba(110,231,183,X)` with the matching `rgba(217,119,87,X)` on lines 79 (two occurrences), 80, 113, 114, 401, 402, 424, 498, 511, 538, 647, 702. Lines 81, 90: `var(--mint-glow)` → `var(--accent-glow)`.

- [ ] **Step 5: `app/app/customizableDashboard.module.css`**

- Lines 41, 396, 655: `color: #042a1c;` → `color: #241505;`
- Lines 229, 257, 279, 288, 364, 373, 484, 494, 589, 672: `rgba(110, 231, 183, X)` → `rgba(217, 119, 87, X)`

- [ ] **Step 6: `components/WelcomeBackdrop.module.css`**

- Lines 31, 32: `var(--wall-accent, #6EE7B7)` → `var(--wall-accent, #D97757)`

- [ ] **Step 7: Verify**

Run: `grep -rn "6EE7B7\|042a1c\|110,\s*231,\s*183\|var(--mint" app/app/dashboardHeaderGem.module.css app/app/Dashboard.tsx app/app/DashboardGrid.tsx app/app/dashboard.module.css app/app/customizableDashboard.module.css components/WelcomeBackdrop.module.css | grep -v "line 265"`
Expected: no output (DashboardGrid.tsx's prompt string on line 265 is intentionally deferred to Task 9 — if it's the only remaining hit, that's correct).

- [ ] **Step 8: Commit**

```bash
git add app/app/dashboardHeaderGem.module.css app/app/Dashboard.tsx app/app/DashboardGrid.tsx app/app/dashboard.module.css app/app/customizableDashboard.module.css components/WelcomeBackdrop.module.css
git commit -m "Cascade accent token rename into dashboard, gem chrome, and backdrop"
```

---

### Task 3: Recolor the 3D gem material (`components/HeroCrystal.tsx`)

**Files:**
- Modify: `components/HeroCrystal.tsx`

**Interfaces:**
- Produces: `TINTS.mint` (key name unchanged — see Global Constraints) now renders in the new accent. `GemTint = 'mint' | 'amber' | 'iris'` is unchanged; only the `mint` entry's values change. `amber` and `iris` (the separate "coach family" colorways) are untouched.

- [ ] **Step 1: Recolor the base THREE.Color constants**

Old:
```ts
const MINT = new THREE.Color('#6EE7B7')
const WARM = new THREE.Color('#FFE2B5')
const COOL_MINT = new THREE.Color('#A7F3D0')
const NEUTRAL = new THREE.Color('#F2FFF8')
```
New:
```ts
const MINT = new THREE.Color('#D97757')
const WARM = new THREE.Color('#FFE2B5')
const COOL_MINT = new THREE.Color('#E8B5A0')
const NEUTRAL = new THREE.Color('#FFF6F2')
```
(`COOL_MINT` and `NEUTRAL` are the light-end blend targets for the glass/key-color gradients — shifted to warm-neutral tones so `computeGlassColor()`/`computeKeyColor()`, which lerp toward `MINT`, land on a coherent warm palette instead of clashing a leftover cool mint highlight against the new orange base.)

- [ ] **Step 2: Recolor the `mint` entry in `TINTS`**

Old:
```ts
  mint:  { glass: null,      atten: '#6EE7B7', emissive: '#0d4a36', wire: 0xa7f3d0,
           env1: ['rgba(180,255,220,1)', 'rgba(110,231,183,0.45)', 'rgba(110,231,183,0)'], env3: ['rgba(140,220,190,0.9)', 'rgba(140,220,190,0)'] },
```
New:
```ts
  mint:  { glass: null,      atten: '#D97757', emissive: '#3a1d0d', wire: 0xe8b5a0,
           env1: ['rgba(255,225,205,1)', 'rgba(217,119,87,0.45)', 'rgba(217,119,87,0)'], env3: ['rgba(225,170,140,0.9)', 'rgba(225,170,140,0)'] },
```
(`amber:` and `iris:` rows immediately below are untouched — different colorways, out of scope.)

- [ ] **Step 3: Verify**

Run: `grep -n "6EE7B7\|A7F3D0\|F2FFF8\|0d4a36\|110,231,183\|140,220,190" components/HeroCrystal.tsx`
Expected: no output.

- [ ] **Step 4: Restart the dev server and check the gem visually**

Run: `npm run dev` (if not already running), open the dashboard, confirm the header gem renders in warm orange glass with its moods/pulses (rings/particles/sparkles) unchanged in timing and shape — only the color changed.

- [ ] **Step 5: Commit**

```bash
git add components/HeroCrystal.tsx
git commit -m "Recolor the gem's default (mint) colorway to the new accent"
```

---

### Task 4: Icons and PWA/browser theme metadata

**Files:**
- Modify: `app/icon.tsx`
- Modify: `app/apple-icon.tsx`
- Modify: `app/manifest.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: `app/icon.tsx`**

- Line 17: `fill="#1f4d3d"` → `fill="#3D2B22"`
- Line 21: `fill="#6EE7B7"` → `fill="#D97757"`
- Lines 23, 24: `fill="#1f4d3d"` → `fill="#3D2B22"`
- Line 38: `background: '#04060a',` → `background: '#141414',`

- [ ] **Step 2: `app/apple-icon.tsx`**

- Line 15: `fill="#1f4d3d"` → `fill="#3D2B22"`
- Line 19: `fill="#6EE7B7"` → `fill="#D97757"`
- Lines 21, 22: `fill="#1f4d3d"` → `fill="#3D2B22"`
- Line 36: `background: '#04060a',` → `background: '#141414',`

- [ ] **Step 3: `app/manifest.ts`**

- Line 21: `background_color: '#04060a',` → `background_color: '#141414',`
- Line 22: `theme_color: '#04060a',` → `theme_color: '#141414',`

- [ ] **Step 4: `app/layout.tsx`**

- Line 59: `themeColor: '#04060a',` → `themeColor: '#141414',`

- [ ] **Step 5: Verify**

Run: `grep -n "6EE7B7\|1f4d3d\|04060a" app/icon.tsx app/apple-icon.tsx app/manifest.ts app/layout.tsx`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add app/icon.tsx app/apple-icon.tsx app/manifest.ts app/layout.tsx
git commit -m "Recolor favicon/home-screen icon and PWA theme color"
```

---

### Task 5: Board chrome defaults (`lib/tiles/dashboardChrome.ts`)

**Files:**
- Modify: `lib/tiles/dashboardChrome.ts`

**Interfaces:**
- Produces: `DEFAULT_CHROME` with the new accent as the default World wallpaper color and gem tint; `WALLPAPER_ACCENTS` with the `Mint` swatch removed (5 entries remain).

- [ ] **Step 1: Update the doc comment (lines 47–48)**

Old:
```ts
/** The default reproduces today's look exactly: the mint World, the auto
 *  time-of-day greeting with the accented name, the full date, the mint gem.
 *  Existing users see zero change until they touch something. */
```
New:
```ts
/** The default reproduces today's look exactly: the accent World, the auto
 *  time-of-day greeting with the accented name, the full date, the accent gem.
 *  Existing users see zero change until they touch something. */
```

- [ ] **Step 2: Recolor `DEFAULT_CHROME` (lines 50–55)**

Old:
```ts
export const DEFAULT_CHROME: DashboardChrome = {
  background: { mode: 'world', accent: '#6EE7B7', particles: 24, mountains: true, speed: 1 },
  greeting: { mode: 'auto', text: '', showName: true, accentName: true, scale: 1 },
  date: { show: true, format: 'full' },
  gem: { show: true, tint: 'mint' },
}
```
New:
```ts
export const DEFAULT_CHROME: DashboardChrome = {
  background: { mode: 'world', accent: '#D97757', particles: 24, mountains: true, speed: 1 },
  greeting: { mode: 'auto', text: '', showName: true, accentName: true, scale: 1 },
  date: { show: true, format: 'full' },
  gem: { show: true, tint: 'accent' },
}
```

- [ ] **Step 3: Remove the `Mint` swatch from `WALLPAPER_ACCENTS` (lines 58–65)**

Old:
```ts
export const WALLPAPER_ACCENTS: { name: string; hex: string }[] = [
  { name: 'Mint', hex: '#6EE7B7' },
  { name: 'Azure', hex: '#6EA8FF' },
  { name: 'Ice', hex: '#CFE9FF' },
  { name: 'Amber', hex: '#F5B044' },
  { name: 'Violet', hex: '#B794F6' },
  { name: 'Rose', hex: '#F49AC2' },
]
```
New:
```ts
export const WALLPAPER_ACCENTS: { name: string; hex: string }[] = [
  { name: 'Azure', hex: '#6EA8FF' },
  { name: 'Ice', hex: '#CFE9FF' },
  { name: 'Amber', hex: '#F5B044' },
  { name: 'Violet', hex: '#B794F6' },
  { name: 'Rose', hex: '#F49AC2' },
]
```

- [ ] **Step 4: Recolor the `backgroundAccent()` fallback (lines 147–151)**

Old:
```ts
export function backgroundAccent(bg: Background): string {
  if (bg.mode === 'world') return bg.accent
  if (bg.mode === 'gradient') return '#6EE7B7'
  return '#6EE7B7'
}
```
New:
```ts
export function backgroundAccent(bg: Background): string {
  if (bg.mode === 'world') return bg.accent
  if (bg.mode === 'gradient') return '#D97757'
  return '#D97757'
}
```

- [ ] **Step 5: Verify**

Run: `grep -n "6EE7B7\|mint\|Mint" lib/tiles/dashboardChrome.ts`
Expected: no output (the `GemConfig.tint: 'mint' | 'accent'` type union and any type-level `'mint'` string literal in type definitions are untouched — only `DEFAULT_CHROME`'s default *value* changed from `'mint'` to `'accent'`; if grep still shows the type definition line, that's expected and correct).

- [ ] **Step 6: Commit**

```bash
git add lib/tiles/dashboardChrome.ts
git commit -m "Default the board chrome to the new accent; drop Mint from the wallpaper picker"
```

---

### Task 6: Mentor tile and vee-tiles animation/styling

**Files:**
- Modify: `app/mentor/MentorPage.tsx`
- Modify: `components/veeTiles.css`
- Modify: `components/veeTilesAnim.ts`

- [ ] **Step 1: `app/mentor/MentorPage.tsx`**

- Line 110: `const accent = act?.accent ?? '#6EE7B7'` → `const accent = act?.accent ?? '#D97757'`
- Line 214: `const gA = g.accent ?? '#6EE7B7'` → `const gA = g.accent ?? '#D97757'`

- [ ] **Step 2: `components/veeTiles.css`**

- Line 10: `--mint:#6EE7B7; --mint-hi:#A7F3D0;` → `--mint:#D97757; --mint-hi:#E8B5A0;` (identifiers `--mint`/`--mint-hi` unchanged per Global Constraints — only values)
- Lines 66, 71, 96 (×2 via drop-shadow), 97, 98 (×2), 100 (×2), 101 (×2), 102, 103 (×2), 104, 106, 107, 108: replace every `rgba(110,231,183,X)` with `rgba(217,119,87,X)`
- Line 100: `background:#eafff5;` and `rgba(167,243,208,.95)` → `background:#fef2ec;` and `rgba(232,181,160,.95)` (the light "node" highlight color, the warm-tone equivalent of the old pale-mint highlight)
- Line 102: `rgba(167,243,208,.4)` → `rgba(232,181,160,.4)`
- Line 105, 194, 107, 108: `var(--mint)` stays `var(--mint)` (identifier unchanged, now resolves to the new value from line 10)

- [ ] **Step 3: `components/veeTilesAnim.ts`**

- Line 48: `const COLORS=['#6EE7B7','#A7F3D0','#b9a3ff','#e8c878','#E8964A','#7fd5e8'];` → `const COLORS=['#D97757','#A7F3D0','#b9a3ff','#e8c878','#E8964A','#7fd5e8'];` (only the first entry changes — the other 5 are distinct multi-series hues, untouched)
- Line 52: `const MINT='#6EE7B7';` → `const MINT='#D97757';` (identifier name `MINT` unchanged per Global Constraints)

- [ ] **Step 4: Verify**

Run: `grep -n "6EE7B7\|167,243,208\|eafff5" app/mentor/MentorPage.tsx components/veeTiles.css components/veeTilesAnim.ts`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add app/mentor/MentorPage.tsx components/veeTiles.css components/veeTilesAnim.ts
git commit -m "Recolor Mentor tile and vee-tiles accents"
```

---

### Task 7: Tile library source files (`tiles-library/*.html`, all 7)

**Files:**
- Modify: `tiles-library/brand.html`, `tiles-library/finance.html`, `tiles-library/fuel.html`, `tiles-library/peak.html`, `tiles-library/train.html`, `tiles-library/vee.html`, `tiles-library/vitals.html`

Each file is self-contained with its own local color declarations — apply the master substitution table to each file's own values only (never introduce a shared variable across files).

- [ ] **Step 1: `tiles-library/brand.html`**

- Line 25: `--brand:#6EE7B7;--brand-soft:rgba(110,231,183,.08);` → `--brand:#D97757;--brand-soft:rgba(217,119,87,.08);`
- Line 72: `rgba(110,231,183,.25)` → `rgba(217,119,87,.25)`
- Line 152: `||'#6EE7B7';` → `||'#D97757';`
- Line 181: `color:'#6EE7B7',` → `color:'#D97757',`

- [ ] **Step 2: `tiles-library/finance.html`**

- Line 20: `--brand:#6EE7B7;` → `--brand:#D97757;`
- Line 32: `rgba(110,231,183,.13)` → `rgba(217,119,87,.13)`
- Line 47: `rgba(110,231,183,.22)` → `rgba(217,119,87,.22)`
- Line 63: `rgba(110,231,183,.09)` → `rgba(217,119,87,.09)`
- Line 82: `rgba(110,231,183,.25)` → `rgba(217,119,87,.25)`
- Lines 140, 141 (×2), 142: `#6EE7B7` → `#D97757`

- [ ] **Step 3: `tiles-library/fuel.html`**

- Line 16: `--brand:#6EE7B7;--brand-soft:rgba(110,231,183,.08);` → `--brand:#D97757;--brand-soft:rgba(217,119,87,.08);`
- Line 27: `rgba(110,231,183,.13)` → `rgba(217,119,87,.13)`
- Line 44: `rgba(110,231,183,.25)` → `rgba(217,119,87,.25)`
- Line 56: `rgba(110,231,183,.25)` → `rgba(217,119,87,.25)`
- Line 61: `rgba(110,231,183,.25)` → `rgba(217,119,87,.25)`

- [ ] **Step 4: `tiles-library/peak.html`**

- Line 24: `--mint:#6EE7B7;` → `--mint:#D97757;` (identifier unchanged)
- Line 25: `--mint-glow:rgba(110,231,183,0.5);` → `--mint-glow:rgba(217,119,87,0.5);`
- Lines 45, 73, 79, 91: `rgba(110,231,183,X)` → `rgba(217,119,87,X)`
- Line 151: `stroke="#6EE7B7"` → `stroke="#D97757"`
- Line 298: `Peak:'#6EE7B7',Solid:'#6EE7B7',` → `Peak:'#D97757',Solid:'#D97757',`
- Line 337: `fill="#6EE7B7"` → `fill="#D97757"`
- Line 340: `mint:['#6EE7B7','rgba(110,231,183,0.12)'],` → `mint:['#D97757','rgba(217,119,87,0.12)'],` (key `mint` unchanged)
- Line 360: `rgba(110,231,183,0.45)` → `rgba(217,119,87,0.45)`
- Line 367: `'rgba(110,231,183,0.35)':seg.value<0?'#EF4444':'#6EE7B7';` → `'rgba(217,119,87,0.35)':seg.value<0?'#EF4444':'#D97757';`
- Line 376: `'#6EE7B7':t.value>=-20` → `'#D97757':t.value>=-20`
- Lines 394, 395 (×2), 396 (×2), 397 (×2): `#6EE7B7` → `#D97757` (keep each `stop-opacity` suffix as-is)
- Line 436: `const REST='#6EE7B7';` → `const REST='#D97757';`
- Line 509: `mint:'#6EE7B7',amber:...` → `mint:'#D97757',amber:...` (key unchanged)
- Line 510: `mint:'rgba(110,231,183,0.10)',...` → `mint:'rgba(217,119,87,0.10)',...` (key unchanged)
- Line 524: `#6EE7B755` → `#D9775755`
- Line 527: `'#6EE7B7':t.value>=-20` → `'#D97757':t.value>=-20`
- Line 534: `rgba(110,231,183,0.4)` and `rgba(110,231,183,0.5)` → `rgba(217,119,87,0.4)` / `rgba(217,119,87,0.5)`

- [ ] **Step 5: `tiles-library/train.html`**

- Line 15 (comment): `(#6EE7B7);` → `(#D97757);`
- Line 19: `--mint:#6EE7B7;` → `--mint:#D97757;` (identifier unchanged)
- Line 24: `--mint-ic:#6EE7B7;` → `--mint-ic:#D97757;` (identifier unchanged)
- Lines 46 (×3), 51, 86, 116, 117 (×2), 123, 124, 132 (×3), 133 (×2), 150, 162, 180, 194, 211 (×2), 276, 338: replace every `rgba(110,231,183,X)` with `rgba(217,119,87,X)`. `var(--mint)` occurrences (lines 86, 117, 132, 133, 162, 180, 211, 276) keep the identifier — they'll resolve to the new value automatically once line 19/24 change.

- [ ] **Step 6: `tiles-library/vee.html`**

- Line 14: `--brand:#6EE7B7;` → `--brand:#D97757;`
- Line 15: `--brand-soft:rgba(110,231,183,.08);--brand-line:rgba(110,231,183,.35);` → `--brand-soft:rgba(217,119,87,.08);--brand-line:rgba(217,119,87,.35);`
- Line 29: `rgba(110,231,183,.35)` → `rgba(217,119,87,.35)`

- [ ] **Step 7: `tiles-library/vitals.html`**

- Line 21: `--brand:#6EE7B7;` → `--brand:#D97757;`
- Line 23: `--good:#6EE7B7;--watch:#E8C878;--low:#ff8b8b;` → `--good:#D97757;--watch:#E8C878;--low:#ff8b8b;` (per spec addendum: "no other hue introduced" — `--good` maps through the same table even though its semantic name differs)
- Line 34: `rgba(110,231,183,.13)` → `rgba(217,119,87,.13)`
- Line 51: `rgba(110,231,183,.22)` → `rgba(217,119,87,.22)`
- Line 85: `rgba(110,231,183,.25)` → `rgba(217,119,87,.25)`
- Line 130: `stroke="#6EE7B7"` → `stroke="#D97757"`

- [ ] **Step 8: Verify**

Run: `grep -rn "6EE7B7\|6ee7b7" tiles-library/*.html`
Expected: no output.

- [ ] **Step 9: Commit**

```bash
git add tiles-library/
git commit -m "Recolor the 7 tile-library source files to the new accent"
```

---

### Task 8: Public tiles mirror — independent edits, NOT copied (`public/tiles/*.html`)

**Files:**
- Modify: `public/tiles/brand.html`, `public/tiles/finance.html`, `public/tiles/peak.html`, `public/tiles/train.html`, `public/tiles/vee.html`, `public/tiles/vitals.html`
- Do **not** modify: `public/tiles/fuel.html` — already its own gold/black palette, zero mint references (verified: no match for the old accent table in this file)

`brand.html`, `peak.html`, `train.html`, `vee.html`, `vitals.html` are currently byte-identical to their `tiles-library` counterparts (confirmed via `diff -q` before any edits). Since Task 7 applies the exact same substitution table to that same starting content, the deterministic result is also identical — so these 5 are copied from the now-recolored `tiles-library` rather than hand-edited a second time. `finance.html` has diverged (extra `--alert`/`--alert-ink` fields not in `tiles-library`) and is edited independently on its own line numbers.

**This task must run after Task 7 is committed.**

- [ ] **Step 1: Re-confirm the 5 files are still identical to their `tiles-library` source (pre-copy safety check)**

Run: `for f in brand peak train vee vitals; do diff -q "tiles-library/$f.html" "public/tiles/$f.html"; done`
Expected: 5 lines, each `Files tiles-library/X.html and public/tiles/X.html differ` (they will differ now — `tiles-library` was recolored in Task 7, `public/tiles` has not been touched yet). This confirms nothing else changed either side in between; if a diff shows anything beyond the recolor, stop and investigate before copying.

- [ ] **Step 2: Copy the 5 already-recolored files over their public/tiles counterparts**

```bash
cp tiles-library/brand.html public/tiles/brand.html
cp tiles-library/peak.html public/tiles/peak.html
cp tiles-library/train.html public/tiles/train.html
cp tiles-library/vee.html public/tiles/vee.html
cp tiles-library/vitals.html public/tiles/vitals.html
```

- [ ] **Step 3: `public/tiles/finance.html`** (own line numbers — diverged from `tiles-library`, edited independently, not copied)

- Line 21: `--brand:#6EE7B7;` → `--brand:#D97757;`
- Line 33: `rgba(110,231,183,.13)` → `rgba(217,119,87,.13)`
- Line 48: `rgba(110,231,183,.22)` → `rgba(217,119,87,.22)`
- Line 64: `rgba(110,231,183,.09)` → `rgba(217,119,87,.09)`
- Line 84: `rgba(110,231,183,.25)` → `rgba(217,119,87,.25)`
- Line 92: `rgba(110,231,183,.6)` → `rgba(217,119,87,.6)`
- Lines 236, 237 (×2), 238: `#6EE7B7` → `#D97757`

- [ ] **Step 4: Confirm `public/tiles/fuel.html` needs no change**

Run: `grep -n "6EE7B7\|6ee7b7" public/tiles/fuel.html`
Expected: no output (confirms the gold living-stack theme has no old-accent references — do not edit this file).

- [ ] **Step 5: Verify the rest**

Run: `grep -rn "6EE7B7\|6ee7b7" public/tiles/brand.html public/tiles/finance.html public/tiles/peak.html public/tiles/train.html public/tiles/vee.html public/tiles/vitals.html`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add public/tiles/brand.html public/tiles/finance.html public/tiles/peak.html public/tiles/train.html public/tiles/vee.html public/tiles/vitals.html
git commit -m "Recolor the 6 live public tiles to the new accent (fuel.html untouched — own gold theme)"
```

---

### Task 9: MCP routes — tile-builder instructions and OAuth consent screen

**Files:**
- Modify: `app/api/mcp/[transport]/route.ts`
- Modify: `app/api/mcp/oauth/authorize/route.ts`
- Modify: `app/app/DashboardGrid.tsx` (the prompt string deferred from Task 2)

- [ ] **Step 1: `app/api/mcp/[transport]/route.ts` — tile-builder instruction string**

Old (line 135, excerpt): `...Match the look: near-black background, mint accent #6EE7B7, clean sans headings...`
New: `...Match the look: charcoal background, orange accent #D97757, clean sans headings...`

- [ ] **Step 2: `app/app/DashboardGrid.tsx` — the `/tile` prompt string**

Old (line 265, excerpt): `...Dark background, mint #6EE7B7. Save and load with...`
New: `...Dark background, orange accent #D97757. Save and load with...`

- [ ] **Step 3: `app/api/mcp/oauth/authorize/route.ts` — consent screen**

Old:
```css
  :root { --bg:#04060a; --mint:#6ee7b7; --ink:#e9efe9; --dim:rgba(233,239,233,.62);
    --line:rgba(110,231,183,.25); --err:#ff8a8a; }
```
New:
```css
  :root { --bg:#141414; --mint:#d97757; --ink:#e9efe9; --dim:rgba(233,239,233,.62);
    --line:rgba(217,119,87,.25); --err:#ff8a8a; }
```
(identifier `--mint` unchanged; only `--bg` and `--mint`'s values change)

Old (line 94): `padding:32px; background:rgba(110,231,183,.04); }`
New: `padding:32px; background:rgba(217,119,87,.04); }`

Old (line 106) — **role exception, not the base-background mapping**:
```css
  .allow { background:var(--mint); color:#04060a; border:none; }
```
New:
```css
  .allow { background:var(--mint); color:#241505; border:none; }
```
(`color` here is the dark text drawn on the accent-filled button — it maps to the new **accent-ink** `#241505`, matching `--mint-ink`/`--accent-ink`'s role elsewhere, not to the new base background `#141414` that the same old hex maps to when it's a page backdrop.)

- [ ] **Step 4: Verify**

Run: `grep -n "6EE7B7\|6ee7b7\|04060a\|110,231,183" "app/api/mcp/[transport]/route.ts" app/api/mcp/oauth/authorize/route.ts app/app/DashboardGrid.tsx`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add "app/api/mcp/[transport]/route.ts" app/api/mcp/oauth/authorize/route.ts app/app/DashboardGrid.tsx
git commit -m "Update tile-builder instructions and OAuth consent screen to the new accent"
```

---

### Task 10: Logger skill template (uninstalled, recolored per user request)

**Files:**
- Modify: `code/the-living-logger.html`
- Modify: `code/the-living-logger.tile.html`

Both files share the same structure and line numbers (verified identical layout from the earlier grep pass). Apply the master substitution table throughout: every `#6EE7B7` → `#D97757`, `#5dd6a6` → `#E8916D`, every `rgba(110,231,183,X)` / `rgba(110, 231, 183, X)` → `rgba(217,119,87,X)` / `rgba(217, 119, 87, X)`, `#042a1c` → `#241505`, `#A7F3D0` (the `--mint-cool` value only, not unrelated uses of that hex elsewhere) → `#E8B5A0`. The line-19 (`.html`) / line-19 (`.tile.html`) token declaration:

Old: `--mint:#6EE7B7; --mint-cool:#A7F3D0; --mint-hover:#5dd6a6; --amber:#F59E0B; --rose:#e0767b; --gold:#f1cf7a;`
New: `--mint:#D97757; --mint-cool:#E8B5A0; --mint-hover:#E8916D; --amber:#F59E0B; --rose:#e0767b; --gold:#f1cf7a;`

(identifiers `--mint`, `--mint-cool`, `--mint-hover` unchanged; `--amber`/`--rose`/`--gold` are distinct hues, untouched)

Confirmed exact-value inventory for these 2 files (no other old-palette values are present in either): `#6EE7B7`, `#5dd6a6`, `rgba(110,231,183,X)` (no-space comma form throughout), `#042a1c`, and the `--mint-cool:#A7F3D0` declaration. This is a uniform substitution with no exceptions in these two files, so it's applied as a scripted replace rather than hand-transcribing ~170 individual lines per file.

- [ ] **Step 1: Apply the substitution table to both files**

```bash
for f in code/the-living-logger.html code/the-living-logger.tile.html; do
  sed -i '' \
    -e 's/#6EE7B7/#D97757/g' \
    -e 's/#5dd6a6/#E8916D/g' \
    -e 's/rgba(110,231,183,/rgba(217,119,87,/g' \
    -e 's/#042a1c/#241505/g' \
    -e 's/--mint-cool:#A7F3D0/--mint-cool:#E8B5A0/g' \
    "$f"
done
```

(identifiers `--mint`, `--mint-cool`, `--mint-hover`, the `.btn-mint` class name, and comment wording like "turns mint" are plain text, not hex/rgba values — the patterns above only match colors, so none of these names are touched.)

- [ ] **Step 2: Verify**

Run: `grep -n "6EE7B7\|5dd6a6\|042a1c\|110,\s*231,\s*183\|A7F3D0" code/the-living-logger.html code/the-living-logger.tile.html`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add code/the-living-logger.html code/the-living-logger.tile.html
git commit -m "Recolor the uninstalled logger tile template to the new accent"
```

---

### Task 11: Final sweep and visual verification

**Files:** none modified — verification only.

- [ ] **Step 1: Full-repo grep sweep**

Run: `grep -rln --include='*.ts' --include='*.tsx' --include='*.css' --include='*.html' -E '6EE7B7|6ee7b7|5dd6a6|1f4d3d|042a1c|110,\s*231,\s*183|#04060a' . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git`
Expected: no output. If anything remains, it was missed by an earlier task — fix it there and re-run this sweep before continuing.

- [ ] **Step 2: Start the dev server**

Run: `npm run dev`

- [ ] **Step 3: Visually verify every surface in the browser**

- Dashboard header gem: warm orange glass, moods/pulses (rings/particles/sparkles) unchanged in timing.
- Background: mountains + drifting particles, recolored, same motion.
- Every tile (brand, finance, fuel, peak, train, vee, vitals): loads with existing data intact, new accent color, no mint anywhere. Confirm `fuel` still shows its own gold/black look (unchanged, by design).
- Mentor tile: same layout, new accent.
- `/app/api/mcp/oauth/authorize` consent screen: new accent, readable button text.
- Favicon and phone "Add to Home Screen" icon/splash: new colors.

- [ ] **Step 4: Confirm no data loss**

Open each tile and confirm existing saved data (goals, weights, logs) still renders — this was a pure recolor, so nothing here should have changed.
