import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SessionMenu from './SessionMenu'
import { parseRotationDays } from './splitData'
import { getLocalDateKey } from '@/lib/dates'
import { getRecentDayStatuses, getDeloadedDayNamesSince, type DayStatus } from '@/lib/workouts/queries'

/**
 * Entry point for SplitLog v2.
 *
 * Gating: if the user hasn't completed the fitness setup yet
 * (no `training_settings` row, or setup_complete=false), redirect to
 * /app/fitness/setup. Otherwise load the customized rotation from
 * training_settings.rotation_days and hand it to SessionMenu.
 */
export default async function WorkoutLoggerPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Defensive query — explicitly capture the error so we can log it. Without
  // this, a missing column or RLS failure silently returned null and the
  // page would silently redirect to /app/fitness/setup OR render with
  // unexpected null data.
  const { data: settings, error } = await supabase
    .from('training_settings')
    .select('rotation_days, setup_complete, intake_rec')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('[/app/fitness/log] training_settings query error:', error.message, error.code)
    // Treat any query error as "setup not complete" — fall through to wizard.
    // Once the user runs through the wizard, the row exists with the right shape.
    redirect('/app/fitness/setup')
  }

  if (!settings || !settings.setup_complete) {
    redirect('/app/fitness/setup')
  }

  const split = parseRotationDays(settings.rotation_days)
  if (!split) {
    redirect('/app/fitness/setup')
  }

  // Pull unit preference from user_profile so the kg/lbs toggle starts in the
  // right state. Default to metric if the row is missing or the column null.
  const { data: profile } = await supabase
    .from('user_profile')
    .select('units')
    .eq('user_id', user.id)
    .maybeSingle()
  const units = (profile?.units === 'imperial' ? 'imperial' : 'metric') as 'metric' | 'imperial'

  const intakeCompleted = !!settings.intake_rec

  // Recent workout statuses → each schedule tile knows if its day is
  // completed / unfinished. Look back roughly one rotation's worth of days
  // (plus slack) so stale sessions don't keep a tile marked done forever.
  const lookbackDays = Math.max(split.length * 2, 14)
  const since = new Date()
  since.setDate(since.getDate() - lookbackDays)

  // "Start a new week" marker — best-effort, separate select so a pre-migration
  // DB (no cycle_started_at column) just behaves as if no reset ever happened.
  let cycleStartedAt: string | null = null
  try {
    const cs = await supabase
      .from('training_settings')
      .select('cycle_started_at')
      .eq('user_id', user.id)
      .maybeSingle()
    if (!cs.error) cycleStartedAt = (cs.data?.cycle_started_at as string | null) ?? null
  } catch {
    // Column not migrated onto this DB yet — ignore and show every tile.
  }

  let dayStatuses: Record<string, DayStatus> = {}
  try {
    dayStatuses = await getRecentDayStatuses(supabase, user.id, getLocalDateKey(since))
    // A new-week reset hides every day completed on or before the reset moment,
    // so the board clears instantly. Unfinished / in-progress days stay (they're
    // already openable, never a dead end); completions after the marker re-light.
    if (cycleStartedAt) {
      const marker = new Date(cycleStartedAt).getTime()
      for (const name of Object.keys(dayStatuses)) {
        const s = dayStatuses[name]
        if (s.submittedAt && new Date(s.submittedAt).getTime() <= marker) {
          delete dayStatuses[name]
        }
      }
    }
  } catch (e) {
    // Status is non-critical chrome — never block the schedule on it.
    console.error('[/app/fitness/log] getRecentDayStatuses error:', e)
  }

  // Deload week: is one active right now? Mirror the [day] page's window math so
  // the board shows a "deload week" badge (in place of "Take a deload week") and
  // lets the user end it from here. Source of truth = training_settings
  // .deload_started_on; the days still owed an easy session are derived from
  // off_day='deload' workout rows. Best-effort: a missing column (pre-migration)
  // just reads as no deload.
  let deloadActive = false
  let deloadRemaining = 0
  let deloadTotal = 0
  try {
    const deloadRes = await supabase
      .from('training_settings')
      .select('deload_started_on')
      .eq('user_id', user.id)
      .maybeSingle()
    const startedOn = (!deloadRes.error && deloadRes.data?.deload_started_on)
      ? (deloadRes.data.deload_started_on as string)
      : null
    if (startedOn) {
      const todayKey = getLocalDateKey()
      const daysSince = Math.floor(
        (new Date(`${todayKey}T00:00:00`).getTime() - new Date(`${startedOn}T00:00:00`).getTime()) / 86_400_000,
      )
      // 3-week safety window — an abandoned start stops counting after ~21 days.
      if (daysSince >= 0 && daysSince <= 21) {
        const trainingDayNames = Array.from(new Set(split.filter(d => d.exercises.length > 0).map(d => d.name)))
        deloadTotal = trainingDayNames.length
        const easedAlready = await getDeloadedDayNamesSince(supabase, user.id, startedOn)
        deloadRemaining = trainingDayNames.filter(n => !easedAlready.includes(n)).length
        deloadActive = deloadRemaining > 0
      }
    }
  } catch {
    // deload_started_on not migrated onto this DB yet — treat as no deload.
  }

  return (
    <SessionMenu
      split={split}
      units={units}
      intakeCompleted={intakeCompleted}
      userId={user.id}
      todayKey={getLocalDateKey()}
      dayStatuses={dayStatuses}
      cycleStartedAt={cycleStartedAt}
      deloadActive={deloadActive}
      deloadRemaining={deloadRemaining}
      deloadTotal={deloadTotal}
    />
  )
}
