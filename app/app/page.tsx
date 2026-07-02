import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Dashboard from './Dashboard'
import type { Units } from '@/lib/units'
import { getDashboardTileStats } from '@/lib/vitality/dashboardStats'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard · Vitality',
}

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Layout guards already redirect anon → /login; belt-and-suspenders here too.
  if (!user) redirect('/')

  // Greeting name + units. A fresh signup is auto-seeded a user_profile row by
  // the handle_new_user trigger, so this normally has a row; guarded regardless.
  let firstName: string | null = null
  let units: Units = 'metric'
  try {
    const { data: userProfile } = await supabase
      .from('user_profile')
      .select('first_name, units')
      .eq('user_id', user.id)
      .maybeSingle()
    firstName = userProfile?.first_name ?? null
    units = (userProfile?.units === 'imperial' ? 'imperial' : 'metric') as Units
  } catch {
    // greet generically
  }

  // The maker handle drives the top-bar profile avatar. Null when not claimed.
  let creatorHandle: string | null = null
  try {
    const { data: creator } = await supabase
      .from('creator_profiles')
      .select('username')
      .eq('user_id', user.id)
      .maybeSingle()
    creatorHandle = creator?.username ?? null
  } catch {
    creatorHandle = null
  }

  // Train tile's live "most recent session" stat (the one core module with a
  // server-readable source in the base). Guarded so a fresh DB just shows nothing.
  const tileStats = await getDashboardTileStats(supabase, user.id).catch(() => ({
    trainDay: null,
    fuelKcalToday: null,
  }))

  return (
    <Dashboard
      firstName={firstName}
      units={units}
      tasks={[]}
      userId={user.id}
      creatorHandle={creatorHandle}
      avatarUrl={null}
      score={null}
      scoreState="no-routine"
      tileStats={tileStats}
    />
  )
}
