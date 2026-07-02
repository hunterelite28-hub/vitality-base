/**
 * Leading per-tile metrics for the dashboard, read live from each module's
 * store. A tile shows its metric only when there's real data; otherwise the
 * field is null and the tile renders no stat (no fake placeholder).
 *
 * Base model: Train (most recent logged session) is the only core tile with a
 * live server-readable source. The other tiles ship as posters, so they show
 * nothing until a user replaces them with their own tile.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

export interface DashboardTileStats {
  /** Most recent logged workout's day name (e.g. "Push A"), or null if none. */
  trainDay: string | null
  /** Kept for tile-shape compatibility; always null in the base (no Fuel module). */
  fuelKcalToday: number | null
}

const EMPTY: DashboardTileStats = { trainDay: null, fuelKcalToday: null }

export async function getDashboardTileStats(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardTileStats> {
  const stats: DashboardTileStats = { ...EMPTY }

  // Train — the most recent submitted session's day name.
  try {
    const { data } = await supabase
      .from('workouts')
      .select('day_name')
      .eq('user_id', userId)
      .not('submitted_at', 'is', null)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()
    const dayName = (data?.day_name as string | undefined)?.trim()
    if (dayName) stats.trainDay = dayName
  } catch {
    // leave null — the tile just shows no stat
  }

  return stats
}
