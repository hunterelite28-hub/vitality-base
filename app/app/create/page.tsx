import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CreateTile from './CreateTile'

export const dynamic = 'force-dynamic'

/**
 * /app/create — the tile host. The platform's first brick.
 *
 * Renders a single sealed tile inside a sandboxed iframe and wires the
 * Vitality bridge (save / load over postMessage). v1 persists to
 * localStorage scoped per user, so the engine is provable with zero backend.
 * The bridge swaps to Supabase later without touching a single tile.
 *
 * This page is the foundation the library + the MCP scaffold sit on:
 *   tile host (here) -> Create page -> library -> MCP scaffold -> Vee report.
 * See the tile-platform direction (docs) before extending.
 */
export default async function CreatePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <CreateTile userId={user.id} />
}
