'use server'

/**
 * Vitality.report() server write. The thin authed wrapper around
 * lib/tiles/reportWrites: resolves the user from the SESSION (never the iframe),
 * then upserts the stream + datapoint under RLS. The tile-to-Vee waist in code.
 *
 * Never throws to the client; the tile fires this and does not block on it.
 */

import { createClient } from '@/lib/supabase/server'
import { reportStreamWith, type DbLike } from '@/lib/tiles/reportWrites'

export async function reportStream(
  tileId: string,
  input: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'unauthorized' }

  // tileId comes from the HOST's window registry (useTileHost), so a stream's
  // per-tile identity is real: two tiles reporting the same key stay separate.
  const res = await reportStreamWith(supabase as unknown as DbLike, user.id, tileId, input)
  return res.ok ? { ok: true } : { ok: false, error: res.error }
}
