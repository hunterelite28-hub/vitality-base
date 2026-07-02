'use client'

import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import styles from './dashboard.module.css'
import DashboardHeader from './DashboardHeader'
import WelcomeBackdrop from '@/components/WelcomeBackdrop'
import DashboardHeaderGem from './DashboardHeaderGem'
import DashboardGrid from './DashboardGrid'
import '@/components/veeTiles.css'
import SettingsSheet from '../app/fitness/log/SettingsSheet'
import { setUnits as setUnitsAction } from '../app/fitness/log/actions'
import { SettingsGear } from '@/components/SettingsGear'
import { dashboardChrome, backgroundAccent, DEFAULT_CHROME, type DashboardChrome } from '@/lib/tiles/dashboardChrome'
import type { Units } from '@/lib/units'
import type { OnboardingTask } from '@/lib/onboardingTasks'
import type { ScoreState } from '@/lib/vitality/score'
import type { DashboardTileStats } from '@/lib/vitality/dashboardStats'

interface DashboardProps {
  firstName: string | null
  units: Units
  /** Onboarding tasks + user id passed through to SettingsSheet so the
   *  "Your Vitality setup" entry can render once the user is fully set up. */
  tasks: OnboardingTask[]
  userId: string
  /** The user's maker handle (Arts District). Drives the top-bar profile
   *  avatar: tap goes to /u/<handle>, or /account to claim if absent. */
  creatorHandle?: string | null
  /** The user's uploaded profile photo (public URL), or null → show the initial. */
  avatarUrl?: string | null
  score: number | null
  scoreState: ScoreState
  /** Live leading metric per tile; null fields render no stat. */
  tileStats: DashboardTileStats
}

/**
 * Consolidated dashboard. The Vitality character lives in ONE place in the
 * header: the <DashboardHeaderGem> next to the greeting. Below it sits
 * <VeeTiles> — the animated-orb tile grid ported 1:1 from the approved mockup
 * (public/vee-dashboard.html), each tile a Link to its real module route.
 *
 * Everything around the tiles is unchanged: the <WelcomeBackdrop> aurora +
 * mountains + drifting mint particles, the header gem, the greeting + date, and
 * the top-right gear that opens the shared SettingsSheet (Personal + Edit
 * training setup + unit toggle).
 */
export default function Dashboard({
  firstName,
  units: initialUnits,
  tasks,
  userId,
  creatorHandle,
  avatarUrl,
  score,
  scoreState,
  tileStats,
}: DashboardProps) {
  const avatarInitial = (firstName?.trim()?.[0] || creatorHandle?.[0] || 'V').toUpperCase()
  const profileHref = creatorHandle ? `/u/${creatorHandle}` : '/account'
  const [units, setUnits] = useState<Units>(initialUnits)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [, startTransition] = useTransition()
  // The chrome the user themed (wallpaper + greeting + date + gem). Undefined
  // until mount (localStorage), so SSR + first paint use the defaults — identical
  // to today, no flash.
  const [chrome, setChrome] = useState<DashboardChrome | undefined>(undefined)

  useEffect(() => {
    setChrome(dashboardChrome.get(userId))
  }, [userId])

  function updateChrome(patch: Partial<DashboardChrome>) {
    setChrome((prev) => ({ ...(prev ?? DEFAULT_CHROME), ...patch }))
    dashboardChrome.update(userId, patch)
  }

  function toggleUnits(next: Units) {
    if (next === units) return
    setUnits(next)
    startTransition(async () => {
      const res = await setUnitsAction(next)
      if (!res.ok) setUnits(units)
    })
  }

  // Publish the wallpaper accent so the whole page (gem, greeting name, future
  // tile theming) can pick it up via --wall-accent. The backdrop tints itself.
  const wallAccent = chrome ? backgroundAccent(chrome.background) : '#6EE7B7'
  const showGem = chrome?.gem.show ?? true

  return (
    <main className={`${styles.page} ${styles.oneScreen} grain-overlay`} style={{ ['--wall-accent' as string]: wallAccent }}>
      {/* Canonical brand backdrop — the themeable "world" (aurora + mountains +
          drifting particles, or a gradient / solid the user chose). Fixed layers
          at z 0-2; .shell sits above at z 5. */}
      <WelcomeBackdrop background={chrome?.background} />

      <div className={styles.shell}>
        <div className={styles.headerRow}>
          {showGem && <DashboardHeaderGem className={styles.headerGem} />}
          <DashboardHeader firstName={firstName} greeting={chrome?.greeting} date={chrome?.date} />
          {/* The gear lives inside the header row. On desktop it's pinned to
              the page's top-right corner (position:absolute); on phone it
              becomes a normal flex child, vertically centered with the gem +
              greeting and pushed to the right, so it stays aligned and never
              overlaps the greeting text. */}
          {/* Top-bar profile avatar (Arts District). Always-visible doorway to
              your public maker page; routes to /account to claim a handle when
              you have none yet. Pinned top-right, just left of the gear. */}
          <Link
            href={profileHref}
            className={styles.profileAvatar}
            aria-label={creatorHandle ? 'Your maker profile' : 'Set up your maker profile'}
            title={creatorHandle ? `@${creatorHandle}` : 'Your profile'}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className={styles.profileAvatarImg} />
            ) : (
              <span aria-hidden>{avatarInitial}</span>
            )}
          </Link>
          <button
            type="button"
            className={styles.settingsBtn}
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
            title="Settings"
          >
            <SettingsGear />
          </button>
        </div>

        {/* The fused dashboard: ONE customizable grid. The animated-orb core
            tiles (Train, Fuel, Vitals, Peak, Brand, Finance), the locked Library
            app-folder, the optional Vee tile, and the user's own built tiles all
            live together. Tap Customize to drag, resize, recolor, restyle,
            rename, add, and remove any of them (only Library is locked on). */}
        <DashboardGrid
          userId={userId}
          score={score}
          scoreState={scoreState}
          tileStats={tileStats}
          chrome={chrome}
          onChromeChange={updateChrome}
        />
      </div>

      {settingsOpen && (
        <SettingsSheet
          units={units}
          onUnitsChange={toggleUnits}
          tasks={tasks}
          userId={userId}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </main>
  )
}
