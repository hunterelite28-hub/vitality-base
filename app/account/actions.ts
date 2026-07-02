'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Claim / update the signed-in user's public maker profile (creator_profiles).
 * The username is the one piece the publish flow needs; display name, bio and
 * link are optional. Username rules mirror the DB check: 3–20 chars, lowercase
 * a–z / 0–9 / underscore.
 */
export async function saveMakerProfile(
  _prev: { error?: string; ok?: boolean; username?: string } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean; username?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You need to be signed in.' }

  const username = String(formData.get('username') ?? '')
    .trim()
    .toLowerCase()
  const displayName = String(formData.get('display_name') ?? '').trim()
  const bio = String(formData.get('bio') ?? '').trim()
  const linkUrl = String(formData.get('link_url') ?? '').trim()

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return { error: 'Handle must be 3–20 characters: lowercase letters, numbers, or _.' }
  }
  if (bio.length > 240) return { error: 'Bio is too long (240 max).' }
  if (linkUrl.length > 400) return { error: 'Link is too long.' }

  const { error } = await supabase.from('creator_profiles').upsert(
    {
      user_id: user.id,
      username,
      display_name: displayName || null,
      bio: bio || null,
      link_url: linkUrl || null,
    },
    { onConflict: 'user_id' },
  )

  if (error) {
    // 23505 = unique_violation → the handle is taken by someone else.
    if (error.code === '23505') return { error: 'That handle is already taken.' }
    return { error: 'Could not save — try again.' }
  }

  revalidatePath('/account')
  revalidatePath(`/u/${username}`)
  return { ok: true, username }
}
