/**
 * Tile weights — each input tile's estimated share of the goal (the x's in
 * y = w1·x1 + w2·x2 + …). Shown bottom-right on every row tile.
 *
 * There is NO AI key at runtime: these are plain numbers. The intelligence runs
 * at BUILD time — tell Claude Code your #1 goal and ask it to re-run the math:
 *
 *   "My goal is to be a famous YouTuber and 185 lb lean. Rebalance
 *    lib/tiles/weights.ts so each tile's weight reflects how much that input
 *    actually moves my goal. Must sum to 100."
 *
 * Claude reasons about YOUR goal, edits this file, you reload. That's it.
 * A localStorage override ('vitality:weights') wins over these defaults, so a
 * goals UI (or Claude through the connector) can retune without a code change.
 */

export const DEFAULT_TILE_WEIGHTS: Record<string, number> = {
  train: 22, // training consistency — the body half of the goal
  fuel: 18, // nutrition — you can't out-train the fuel
  vitals: 18, // sleep + recovery gate everything else
  peak: 12, // daily energy rhythm — output quality
  brand: 15, // audience + content — the YouTube half
  finance: 15, // runway — buys the time to keep going
}

/** Current weights: localStorage override if present, else the defaults. */
export function tileWeights(): Record<string, number> {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem('vitality:weights')
      if (raw) {
        const o = JSON.parse(raw)
        if (o && typeof o === 'object') return { ...DEFAULT_TILE_WEIGHTS, ...o }
      }
    } catch {
      /* fall through to defaults */
    }
  }
  return DEFAULT_TILE_WEIGHTS
}
