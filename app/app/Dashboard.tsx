'use client'

import { useEffect, useState } from 'react'
import styles from './dashboard.module.css'
import DashboardHeader from './DashboardHeader'
import WelcomeBackdrop from '@/components/WelcomeBackdrop'
import DashboardHeaderGem from './DashboardHeaderGem'
import DashboardGrid from './DashboardGrid'
import '@/components/veeTiles.css'
import { dashboardChrome, backgroundAccent, DEFAULT_CHROME, type DashboardChrome } from '@/lib/tiles/dashboardChrome'
import { activeGoal } from '@/lib/tiles/weights'
import { site } from '@/content/site'

interface DashboardProps {
  firstName: string | null
  userId: string
}

/* ── "Start from scratch": the DETONATION PROMPT ──
 * The app can no longer destroy anything. Instead it hands you a copy-pasteable
 * prompt for Claude Code: Claude wipes the board to a black screen in code —
 * but its context survives, so it still remembers everything you built and can
 * help you rebuild. The checkbox changes the prompt (keep the ambiance or not). */
function ScratchPanel({ onClose }: { onClose: () => void }) {
  const [keepBg, setKeepBg] = useState(false)
  const [copied, setCopied] = useState(false)

  const prompt = keepBg
    ? 'Detonate my dashboard, but keep the atmosphere. Remove every tile from my board (clear public/tiles of tiles) and strip the middle of the page — no tiles, no onboarding text. KEEP the ambient background (mountains, particles, aurora), the greeting and the date, and the settings gear. Do not touch git history, docs, or your memory of this project — remember everything we built so you can help me rebuild from this clean slate.'
    : 'Detonate my dashboard. Remove every tile from my board (clear public/tiles of tiles) and make it render a pure black screen — no tiles, no greeting, no gem, no background. Keep only the settings gear as the way back. Do not touch git history, docs, or your memory of this project — remember everything we built so you can help me rebuild from this clean slate.'

  const copy = () => {
    navigator.clipboard?.writeText(prompt).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Start from scratch"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'rgba(0,0,0,.62)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          width: 'min(520px, 100%)',
          background: 'var(--bg-elevated, #121212)',
          border: '1px solid var(--border, #262626)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,.6)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px',
            borderBottom: '1px solid var(--border, #262626)',
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--fg, #fff)' }}>Start from scratch?</span>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--muted, #8a8f98)', cursor: 'pointer', padding: 4, display: 'flex' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>
        <div style={{ padding: '22px 24px' }}>
          <p style={{ color: 'var(--muted)', lineHeight: 1.6, margin: 0, fontSize: 14 }}>
            Nothing gets destroyed from here. Paste the <strong style={{ color: 'var(--fg)' }}>detonation prompt</strong>{' '}
            into Claude Code: it wipes the board to a black screen — but Claude{' '}
            <strong style={{ color: 'var(--fg)' }}>keeps the context</strong> of everything you built, so when you start
            building again it already knows your world.
          </p>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 16,
              color: 'var(--fg)',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            <input type="checkbox" checked={keepBg} onChange={(e) => setKeepBg(e.target.checked)} />
            Keep the background (mountains + particles)
          </label>
          <pre
            style={{
              background: 'var(--bg, #000)',
              border: '1px solid var(--border, #262626)',
              borderRadius: 10,
              padding: '12px 14px',
              whiteSpace: 'pre-wrap',
              color: 'var(--fg)',
              fontSize: 12,
              lineHeight: 1.55,
              margin: '14px 0 0',
              maxHeight: 180,
              overflow: 'auto',
            }}
          >
            {prompt}
          </pre>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.7rem 1rem',
                borderRadius: 999,
                background: 'transparent',
                color: 'var(--fg)',
                border: '1px solid var(--border)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={copy}
              style={{
                flex: 1.4,
                padding: '0.7rem 1rem',
                borderRadius: 999,
                background: 'var(--mint, #6EE7B7)',
                color: 'var(--mint-ink, #042a1c)',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {copied ? 'Copied ✓' : 'Copy the detonation prompt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * The whole base app: one dashboard. The Vitality character lives in the header
 * gem next to the greeting; below sits the animated-orb tile grid. Every tile is
 * an inert "slot" you fill with your own sealed HTML (see public/tiles/README.md).
 *
 * Zero backend: chrome (wallpaper + greeting) is localStorage, tiles are static
 * files under /public/tiles, and there's no auth. `userId` is a constant so the
 * localStorage namespaces (chrome, tile skins, layout) stay stable per browser.
 */
export default function Dashboard({ firstName, userId }: DashboardProps) {
  const [chrome, setChrome] = useState<DashboardChrome | undefined>(undefined)
  const [scratchOpen, setScratchOpen] = useState(false)
  const [scratched, setScratched] = useState(false)
  const [goalAccent, setGoalAccent] = useState<string | undefined>(undefined)

  useEffect(() => {
    setChrome(dashboardChrome.get(userId))
    try {
      setScratched(window.localStorage.getItem('vitality:scratched') === '1')
      setGoalAccent(activeGoal()?.accent)
    } catch {
      /* ignore */
    }
    // picking a goal on the board re-tints the whole room, live
    const onGoal = () => setGoalAccent(activeGoal()?.accent)
    window.addEventListener('vitality:goal', onGoal)
    return () => window.removeEventListener('vitality:goal', onGoal)
  }, [userId])

  // The active goal tints the whole room — the main goal turns it gold.
  const wallAccent = goalAccent ?? (chrome ? backgroundAccent(chrome.background) : '#6EE7B7')
  // In scratch mode there's no gem and no avatar. The greeting stays only when the
  // background was kept (world); a pure-black scratch drops it too. The gear (settings)
  // is always there — the way into scratch and back.
  const detonated = site.detonated // set IN CODE by /detonate — deterministic, same every time
  const showGem = (chrome?.gem.show ?? true) && !scratched && !detonated
  const showGreeting = (!scratched || chrome?.background.mode === 'world') && detonated !== 'black'
  const showBoard = !detonated

  // /detonate black: pure black, only the gear and the way back.
  if (detonated === 'black') {
    return (
      <main style={{ minHeight: '100vh', background: '#000', position: 'relative' }}>
        <div style={{ position: 'fixed', top: 24, right: 24 }}>
          <div
            className={styles.profileAvatar}
            onClick={() => setScratchOpen(true)}
            role="button"
            tabIndex={0}
            title="Settings"
            aria-label="Settings"
            style={{ cursor: 'pointer' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
        </div>
        <p
          style={{
            position: 'fixed',
            bottom: 22,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: 'ui-monospace, Menlo, monospace',
            fontSize: 10,
            letterSpacing: '.16em',
            textTransform: 'uppercase',
            color: '#2c2c2c',
          }}
        >
          run /detonate undo in claude code to come back
        </p>
        {scratchOpen && <ScratchPanel onClose={() => setScratchOpen(false)} />}
      </main>
    )
  }

  return (
    <main className={`${styles.page} ${styles.oneScreen} grain-overlay`} style={{ ['--wall-accent' as string]: wallAccent }}>
      <WelcomeBackdrop background={chrome?.background} />
      {/* the active goal's tint over the world — animates on switch (gold = main goal) */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background: `radial-gradient(55% 40% at 50% 0%, ${wallAccent}1f, transparent 70%)`,
          transition: 'background 1.2s ease',
        }}
      />

      <div className={styles.shell}>
        <div className={styles.headerRow}>
          {showGem && <DashboardHeaderGem className={styles.headerGem} />}
          {showGreeting && (
            <DashboardHeader firstName={firstName} greeting={chrome?.greeting} date={chrome?.date} />
          )}
          {/* Settings gear (top-right): opens the scratch panel — the way in, and back. */}
          <div
            className={styles.profileAvatar}
            onClick={() => setScratchOpen(true)}
            role="button"
            tabIndex={0}
            title="Settings"
            aria-label="Settings"
            style={{ cursor: 'pointer' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setScratchOpen(true)
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
        </div>

        <DashboardGrid userId={userId} chrome={chrome ?? DEFAULT_CHROME} />
      </div>

      {scratchOpen && <ScratchPanel onClose={() => setScratchOpen(false)} />}
    </main>
  )
}
