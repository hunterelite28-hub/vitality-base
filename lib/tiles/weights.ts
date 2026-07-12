/**
 * Goals + tile weights — the math of the equation, with NO AI key at runtime.
 *
 *   y = the Mentor (the overseer, where the math lives)
 *   x = each input tile · w = that tile's share of the ACTIVE goal
 *
 * Each goal carries its own weights (sum ≈ 100): "jacked" leans on Train,
 * "charisma" leans on Brand, "finance" leans on Finance. The row badges show
 * the active goal's weights; the Mentor lists every goal with its full breakdown.
 *
 * WHO DOES THE MATH: Claude Code, at build time — not an Anthropic key, not
 * you by hand. In VS Code, say:
 *
 *   "My goals are X and Y. Open lib/tiles/weights.ts and re-run the math:
 *    for each goal, weigh how much each tile's input actually moves it
 *    (ask me questions if you need to). Each goal's weights sum to 100."
 *
 * Claude reasons, edits DEFAULT_GOALS, you reload. Later it can also
 * cross-reference your real tile data (video published vs workouts, water,
 * caffeine) and retune from evidence. A localStorage override
 * ('vitality:goals') wins over these defaults, so the connector or a goals
 * UI can retune without a code change.
 */

export interface Goal {
  id: string
  title: string
  /** tile slot -> % of this goal (sums to ~100) */
  weights: Record<string, number>
  /** true while the mentor (Claude Code) hasn't shaped + weighed it yet */
  pending?: boolean
  /** each goal tints the board a little; the overall goal goes gold */
  accent?: string
  /** how far you've come, 0–100 — computed by the mentor from data sweeps
   *  (analytics, manual logs, wearables), never guessed by the app */
  progress?: number
}

/** One observation the mentor pushed after scanning your data, with any
 *  weight changes it made because of what it found. */
export interface Notice {
  id: string
  when: string
  text: string
  /** bullet points; **bold** marks the highlighted words */
  points?: string[]
  deltas?: { tile: string; from: number; to: number }[]
}

export const DEFAULT_GOALS: Goal[] = [
  {
    id: 'jacked',
    title: 'Build a jacked, strong physique',
    accent: '#FF6B4A',
    // Top priority. Train drives the lifting itself; Fuel is what feeds the
    // gains; Peak (supplements) is the smaller lever. No specific target
    // (weight/bodyfat) set yet — current: 71kg, 179cm, 20yo, see profile.ts —
    // but the tiles that move this goal are clear, so it's weighed now.
    weights: { train: 55, fuel: 30, peak: 15 },
  },
  {
    id: 'charisma',
    title: 'Build an aesthetic, charismatic personal brand',
    accent: '#E1306C',
    // Second priority. Brand carries the Instagram page itself; Train carries
    // the physique that makes it aesthetic. Nothing yet tracks the
    // accent/speaking work — flagged as a tile idea below instead of
    // force-fit into these weights.
    weights: { brand: 70, train: 30 },
  },
  {
    id: 'finance',
    title: 'Build real finance & investing knowledge',
    accent: '#6EE7B7',
    // Third priority. Finance is the only tile tracking this so far — it
    // carries the full weight until a Study tile exists to split it with.
    weights: { finance: 100 },
  },
]

/** The overseer's synthesis of EVERY goal, polished into one sentence by the
 *  mentor (Claude Code). Switching it on = top priority — the board goes gold. */
export const OVERALL_GOAL: Goal = {
  id: 'overall',
  title: 'A jacked, charismatic, knowledgeable finance bro',
  accent: '#E8C878',
  // Blend of the three ranked goals (jacked > charismatic > knowledgeable):
  // train carries lifting from "jacked" AND the physique share of "charisma",
  // so it lands highest; brand and finance follow in priority order; fuel/peak
  // are jacked's smaller levers.
  weights: { train: 37, brand: 21, finance: 20, fuel: 15, peak: 7 },
}

/** Overall first, then the individual goals. */
export function allGoals(): Goal[] {
  return [OVERALL_GOAL, ...goals()]
}

/** The full active Goal (incl. overall), for accent + title. */
export function activeGoal(): Goal | undefined {
  const id = activeGoalId()
  return allGoals().find((g) => g.id === id) ?? goals()[0]
}

/** Empty until the mentor scans real data under the new goals and finds a
 *  pattern worth calling out. */
export const DEFAULT_NOTICED: Notice[] = []

/** A blueprint for a tile they SHOULD have — a gap the mentor found between
 *  their goal and what their tiles actually track. Pre-written by the mentor
 *  (Claude Code) from their data; localStorage 'vitality:ideas' overrides. */
export interface TileIdea {
  /** ONE word — how the idea shows up in the popup (the mentor picks it) */
  word?: string
  title: string
  /** what the tile tracks, in one line */
  tracks: string
  /** why it moves THIS goal — tied to their data when possible */
  why: string
  /** the weight it would likely earn (≈ %) */
  estWeight: number
}

export const DEFAULT_IDEAS: Record<string, TileIdea[]> = {
  overall: [
    {
      word: 'Speaking',
      title: 'Speaking / accent practice',
      tracks: 'practice reps or recordings, per week',
      why: 'Charisma is half the goal but nothing tracks the accent/speaking work itself — Brand only sees the page, not the skill behind it.',
      estWeight: 8,
    },
    {
      word: 'Study',
      title: 'Study log',
      tracks: 'hours against your finance/investing plan',
      why: '"Knowledgeable" needs its own evidence — Finance tracks money moving, not knowledge going in.',
      estWeight: 10,
    },
  ],
  charisma: [
    {
      word: 'Speaking',
      title: 'Speaking / accent practice',
      tracks: 'practice reps or recordings, per week',
      why: 'Brand tracks the page; this would track the actual skill — the accent and delivery work you named as the goal.',
      estWeight: 15,
    },
  ],
  finance: [
    {
      word: 'Study',
      title: 'Study log',
      tracks: 'hours against your finance/investing plan',
      why: 'Finance tracks money moving, not knowledge going in — right now it carries the whole goal alone.',
      estWeight: 15,
    },
  ],
}

/** The mentor's tile recommendations for a goal (localStorage override wins). */
export function tileIdeas(goalId: string): TileIdea[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem('vitality:ideas')
      if (raw) {
        const o = JSON.parse(raw)
        if (o && typeof o === 'object' && Array.isArray(o[goalId])) return o[goalId] as TileIdea[]
      }
    } catch {
      /* fall through */
    }
  }
  return DEFAULT_IDEAS[goalId] ?? DEFAULT_IDEAS.overall ?? []
}

/** The mentor's noticed feed: localStorage override, else the seeded example.
 *  Claude Code (or the connector) writes 'vitality:noticed' after a scan. */
export function noticedFeed(): Notice[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem('vitality:noticed')
      if (raw) {
        const o = JSON.parse(raw)
        if (Array.isArray(o)) return o as Notice[]
      }
    } catch {
      /* fall through */
    }
  }
  return DEFAULT_NOTICED
}

/** Save the goals list (used by the mentor page's goal input). */
export function saveGoals(list: Goal[]): void {
  try {
    window.localStorage.setItem('vitality:goals', JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

/** All goals: localStorage override ('vitality:goals') if valid, else defaults. */
export function goals(): Goal[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem('vitality:goals')
      if (raw) {
        const o = JSON.parse(raw)
        if (Array.isArray(o) && o.every((g) => g && typeof g.id === 'string' && g.weights)) return o as Goal[]
      }
    } catch {
      /* fall through */
    }
  }
  return DEFAULT_GOALS
}

/** The active goal id (persisted). Defaults to the first goal. */
export function activeGoalId(): string {
  if (typeof window !== 'undefined') {
    try {
      const v = window.localStorage.getItem('vitality:goal:active')
      if (v) return v
    } catch {
      /* fall through */
    }
  }
  return goals()[0]?.id ?? ''
}

export function setActiveGoalId(id: string): void {
  try {
    window.localStorage.setItem('vitality:goal:active', id)
  } catch {
    /* ignore */
  }
}

/** The active goal's weights (the badges on the row read these). */
export function tileWeights(): Record<string, number> {
  return activeGoal()?.weights ?? {}
}
