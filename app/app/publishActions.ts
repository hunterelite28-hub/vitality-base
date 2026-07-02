'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { tilePublishPayload, publishedRowToEnvelope } from '@/lib/tiles/publish'
import type { Tile, TileEnvelope } from '@/lib/tiles/types'
import type { Skin } from '@/lib/tiles/tileSkin'

/**
 * Publish + credit server actions (Arts District v3).
 *
 * Publishing snapshots a sealed tile into public.published_tiles, credited to the
 * maker's creator_profiles handle. Reads/writes are RLS-scoped (creator owns own
 * rows; the public shop sees only 'approved'). The add path reuses the LOCKED
 * tileStore.importTile on the client — these actions only fetch the envelope.
 * See docs/superpowers/plans/2026-06-30-arts-district-v3-publish-credit.md.
 */

export interface PublishTileInput {
  tile: Tile
  skin: Skin
  optInReuse?: boolean
}

export interface PublishTileResult {
  ok: boolean
  error?: string
  /** true when the user has no handle yet — UI should send them to /account */
  needsHandle?: boolean
  id?: string
  status?: string
}

export async function publishTile(input: PublishTileInput): Promise<PublishTileResult> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { ok: false, error: 'unauthorized' }

  // Credit requires a claimed handle. Gate publishing on it.
  const { data: profile } = await supabase
    .from('creator_profiles')
    .select('username')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!profile) {
    return { ok: false, needsHandle: true, error: 'Claim your maker handle first.' }
  }

  const payload = tilePublishPayload(input.tile, input.skin, user.id, {
    optInReuse: input.optInReuse,
  })
  if (!payload.ok) return { ok: false, error: payload.error }

  const { data, error } = await supabase
    .from('published_tiles')
    .insert(payload.row)
    .select('id, status')
    .single()
  if (error) return { ok: false, error: error.message }

  revalidatePath(`/u/${profile.username}`)
  return { ok: true, id: data.id, status: data.status }
}

export async function unpublishTile(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { ok: false, error: 'unauthorized' }

  // RLS restricts the delete to the caller's own row; the explicit eq is belt-and-braces.
  const { error } = await supabase
    .from('published_tiles')
    .delete()
    .eq('id', id)
    .eq('creator_id', user.id)
  if (error) return { ok: false, error: error.message }

  // Bump the maker page (best-effort; we don't have the handle here without a read).
  revalidatePath('/u/[username]', 'page')
  return { ok: true }
}

export interface MyPublishedTile {
  id: string
  name: string
  category: string | null
  status: 'pending' | 'approved' | 'rejected'
  install_count: number
  created_at: string
}

export async function listMyPublished(): Promise<MyPublishedTile[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('published_tiles')
    .select('id, name, category, status, install_count, created_at')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })
  return (data ?? []) as MyPublishedTile[]
}

/**
 * Fetch a published tile's importable envelope for the "Add" path. RLS returns
 * the row only if it is approved (public) or owned by the caller, so this is
 * safe to call from any client. v4 will increment install_count here.
 */
export async function getPublishedEnvelope(
  id: string
): Promise<{ ok: true; envelope: TileEnvelope } | { ok: false; error: string }> {
  const supabase = createClient()
  const { data } = await supabase
    .from('published_tiles')
    .select('envelope, name, html')
    .eq('id', id)
    .maybeSingle()
  if (!data) return { ok: false, error: 'not_found' }
  const envelope = publishedRowToEnvelope(data)
  if (!envelope) return { ok: false, error: 'corrupt' }
  return { ok: true, envelope }
}
