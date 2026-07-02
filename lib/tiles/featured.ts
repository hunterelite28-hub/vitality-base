import type { TileEnvelope, ReportKind } from './types'
import featuredHtml from './featuredHtml.json'

/**
 * The Arts District catalog (Pillar 3): a curated gallery of ready-made tiles a
 * user adds in one tap, no Claude needed. Each entry wraps the SAME install
 * envelope every pillar shares (handed to tileStore.importTile) with the shop's
 * display copy. New drops are appended here; Luke + Liam curate weekly.
 *
 * The sealed tile HTML lives in featuredHtml.json (one big blob per id) so this
 * file stays a readable catalog and the htmls never need escaping. Adding a tile
 * to the shop = one JSON entry + one row here.
 */
export interface FeaturedTile {
  /** Stable shop id. NOT the per-user tile id (that is minted fresh on install). */
  id: string
  /** One-line pitch shown on the card. */
  tagline: string
  /** Who made it. 'Vitality' for first-party drops. */
  author: string
  /** Card accent hex. Mint by default; gold / iris give a tile its own character. */
  accent: string
  /** This week's highlighted drop (a small "New" flag on the card). */
  fresh?: boolean
  /** The install envelope handed to tileStore.importTile on Add: the tile's name,
   *  sealed html, display category, poster design, report kind, and skin tint. */
  envelope: TileEnvelope
}

const HTML = featuredHtml as Record<string, string>

const MINT = '#6EE7B7'
const GOLD = '#e8c878'
const IRIS = '#b9a3ff'

/** The flat catalog definition. Kept separate from FEATURED_TILES so the heavy
 *  html is pulled from the json by id and the rest reads as a clean table. */
interface Def {
  id: string
  name: string
  tagline: string
  accent: string
  category: string
  kind: ReportKind
  design: string
  fresh?: boolean
}

const DEFS: Def[] = [
  {
    id: 'water-daily',
    name: 'Water',
    tagline: 'Tap a glass. It resets fresh each morning.',
    accent: MINT,
    category: 'Intake',
    kind: 'intake',
    design: 'tide-layers',
    fresh: true,
  },
  {
    id: 'habit-streak',
    name: 'Habit',
    tagline: 'One habit, one tap, a streak you protect.',
    accent: MINT,
    category: 'Done',
    kind: 'done',
    design: 'effort-ring',
    fresh: true,
  },
  {
    id: 'one-line-journal',
    name: 'One line a day',
    tagline: 'A single honest line about today.',
    accent: IRIS,
    category: 'Count',
    kind: 'count',
    design: 'journal-lines',
  },
  {
    id: 'mood-check',
    name: 'Mood',
    tagline: 'A daily check in, no words needed.',
    accent: GOLD,
    category: 'Rating',
    kind: 'rating',
    design: 'mood-wave',
  },
  {
    id: 'focus-timer',
    name: 'Focus',
    tagline: 'Twenty five quiet minutes, counted.',
    accent: MINT,
    category: 'Duration',
    kind: 'duration',
    design: 'focus-orbit',
  },
]

export const FEATURED_TILES: FeaturedTile[] = DEFS.map((d) => ({
  id: d.id,
  tagline: d.tagline,
  author: 'Vitality',
  accent: d.accent,
  fresh: d.fresh,
  envelope: {
    name: d.name,
    html: HTML[d.id] ?? '',
    category: d.category,
    kind: d.kind,
    design: d.design,
    color: d.accent === MINT ? undefined : d.accent,
  },
}))

/** The categories present in the catalog, in first-seen order, for the shop's
 *  filter chips. 'All' is prepended by the gallery. */
export const FEATURED_CATEGORIES: string[] = Array.from(
  new Set(DEFS.map((d) => d.category)),
)
