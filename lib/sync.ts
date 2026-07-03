'use client'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Optional cross-device sync for tile data.
 *
 * The base is zero-backend by default: a tile's `Vitality.save()` data lives in
 * the browser (localStorage). If the forker adds their OWN Supabase project (two
 * public keys in Vercel), tile data is ALSO written to a single `tile_data` table
 * — so opening the same site on another device (their phone) loads the same data.
 *
 * No login: the deployment is personal, so the anon key + an open policy on the
 * owner's own project is the whole model. If the keys are absent, everything here
 * no-ops and the app stays purely local.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let client: SupabaseClient | null = null

/** Whether cross-device sync is configured (both public keys present). */
export const syncEnabled = (): boolean => !!(url && anonKey)

function syncClient(): SupabaseClient | null {
  if (!url || !anonKey) return null
  if (!client) client = createClient(url, anonKey)
  return client
}

/** Push a tile's data to the owner's Supabase. Best-effort; returns false on any failure. */
export async function syncSave(tileId: string, data: unknown, isoNow: string): Promise<boolean> {
  const c = syncClient()
  if (!c) return false
  try {
    const { error } = await c
      .from('tile_data')
      .upsert({ tile_id: tileId, data, updated_at: isoNow }, { onConflict: 'tile_id' })
    return !error
  } catch {
    return false
  }
}

/** Read a tile's data from Supabase, or null if unconfigured / missing / offline. */
export async function syncLoad(tileId: string): Promise<unknown | null> {
  const c = syncClient()
  if (!c) return null
  try {
    const { data, error } = await c.from('tile_data').select('data').eq('tile_id', tileId).maybeSingle()
    if (error) return null
    return data?.data ?? null
  } catch {
    return null
  }
}
