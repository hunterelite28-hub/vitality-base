'use client'

import { useEffect, useRef, useState } from 'react'
import WelcomeBackdrop from '@/components/WelcomeBackdrop'
import { CORE_TILES } from '@/lib/tiles/coreTiles'
import {
  allGoals,
  activeGoalId,
  setActiveGoalId,
  goals,
  saveGoals,
  noticedFeed,
  type Goal,
  type Notice,
} from '@/lib/tiles/weights'

/**
 * The Mentor — a full page, not a popup. y, the overseer.
 *
 * Everything here is REAL data rendered from lib/tiles/weights.ts +
 * localStorage. There is no AI key in the app: the mentor's thinking runs in
 * Claude Code (ask it, or let a scheduled sweep run). It shapes raw goals into
 * polished ones, weighs every tile, scans your data for patterns, writes what
 * it noticed, and retunes the percentages — this page just shows it, alive.
 */

const label = (tile: string) => CORE_TILES[tile as keyof typeof CORE_TILES]?.label ?? tile

/* ── a number that rolls to its value like a stock ticker ── */
function Roll({ value, color, size = 15 }: { value: number; color?: string; size?: number }) {
  const [shown, setShown] = useState(value)
  const prev = useRef(value)
  useEffect(() => {
    const from = prev.current
    prev.current = value
    if (from === value) return
    const t0 = performance.now()
    const dur = 800
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur)
      const e = 1 - Math.pow(1 - p, 3) // ease-out cubic
      setShown(Math.round(from + (value - from) * e))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return (
    <span
      style={{
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: size,
        color: color ?? 'var(--fg, #fff)',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {shown}%
    </span>
  )
}

export default function MentorPage() {
  const [mounted, setMounted] = useState(false)
  const [list, setList] = useState<Goal[]>([])
  const [active, setActive] = useState('')
  const [feed, setFeed] = useState<Notice[]>([])
  const [draft, setDraft] = useState('')

  useEffect(() => {
    setMounted(true)
    setList(allGoals())
    setActive(activeGoalId())
    setFeed(noticedFeed())
  }, [])

  if (!mounted) return null

  const act = list.find((g) => g.id === active) ?? list[0]
  const accent = act?.accent ?? '#6EE7B7'
  const isGold = act?.id === 'overall'

  const switchGoal = (id: string) => {
    setActiveGoalId(id)
    setActive(id)
  }

  const addGoal = () => {
    const raw = draft.trim()
    if (!raw) return
    const id = 'g-' + raw.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24)
    const next = [...goals(), { id, title: raw, weights: {}, pending: true } as Goal]
    saveGoals(next)
    setList(allGoals())
    setDraft('')
  }

  const mono: React.CSSProperties = {
    fontFamily: 'ui-monospace, Menlo, monospace',
    fontSize: 11,
    letterSpacing: '.16em',
    textTransform: 'uppercase',
  }

  return (
    <main className="grain-overlay" style={{ minHeight: '100vh', position: 'relative', ['--wall-accent' as string]: accent }}>
      <WelcomeBackdrop />
      {/* the active goal tints the room; the main goal turns it gold */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: `radial-gradient(60% 45% at 50% 0%, ${accent}22, transparent 70%)`,
          transition: 'background 1.2s ease',
        }}
      />

      <div style={{ position: 'relative', zIndex: 5, width: 'min(980px, calc(100vw - 40px))', margin: '0 auto', padding: '34px 0 80px' }}>
        <a href="/" style={{ color: 'var(--muted, #8a8f98)', fontSize: 13, textDecoration: 'none' }}>
          ← Dashboard
        </a>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 26 }}>
          <span style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontStyle: 'italic', fontSize: 26, color: accent, transition: 'color .8s ease' }}>y</span>
          <h1 style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(34px, 5vw, 52px)', color: 'var(--fg, #fff)', margin: 0 }}>
            Mentor
          </h1>
        </div>
        <p style={{ ...mono, color: accent, margin: '8px 0 0', transition: 'color .8s ease' }}>the overseer · notices everything</p>

        {/* ── the goals ── */}
        <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {list.map((g) => {
            const isActive = g.id === active
            const gAccent = g.accent ?? '#6EE7B7'
            const isOverall = g.id === 'overall'
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => switchGoal(g.id)}
                style={{
                  textAlign: 'left',
                  background: isActive ? `${gAccent}0d` : 'rgba(10,14,12,.55)',
                  border: `1px solid ${isActive ? gAccent + '66' : 'var(--border, #262626)'}`,
                  borderRadius: 16,
                  padding: '18px 20px',
                  cursor: 'pointer',
                  transition: 'border-color .5s ease, background .5s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: g.pending ? 0 : 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    {isOverall && <span style={{ color: gAccent, fontSize: 15 }}>★</span>}
                    <span
                      style={{
                        fontFamily: 'var(--font-serif), Georgia, serif',
                        fontStyle: 'italic',
                        fontSize: isOverall ? 24 : 19,
                        color: 'var(--fg, #fff)',
                      }}
                    >
                      {g.title}
                    </span>
                  </div>
                  <span style={{ ...mono, fontSize: 10, color: isActive ? gAccent : 'var(--muted, #8a8f98)', flex: '0 0 auto' }}>
                    {isOverall ? (isActive ? '● main goal' : 'the main goal') : isActive ? '● active' : 'switch'}
                  </span>
                </div>

                {isOverall && (
                  <p style={{ margin: '0 0 12px', color: 'var(--muted, #8a8f98)', fontSize: 12.5, lineHeight: 1.5 }}>
                    Every goal, polished into one by the mentor. Top priority — the whole board turns gold.
                  </p>
                )}

                {g.pending ? (
                  <p style={{ margin: '10px 0 0', color: 'var(--muted, #8a8f98)', fontSize: 13, lineHeight: 1.6 }}>
                    <span style={{ color: gAccent }}>◔ waiting for the mentor.</span> Open Claude Code and say{' '}
                    <i style={{ color: 'var(--fg, #fff)' }}>“shape my new goal”</i> — it polishes the wording, weighs every
                    tile, and this card comes alive.
                  </p>
                ) : (
                  Object.entries(g.weights)
                    .sort((a, b) => b[1] - a[1])
                    .map(([tile, w]) => (
                      <div key={tile} style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '7px 0' }}>
                        <span style={{ width: 72, color: 'var(--muted, #8a8f98)', fontSize: 12.5 }}>{label(tile)}</span>
                        <span style={{ flex: 1, height: 4, borderRadius: 999, background: `${gAccent}1f`, overflow: 'hidden' }}>
                          <span
                            style={{
                              display: 'block',
                              width: isActive ? `${Math.min(100, w)}%` : `${Math.min(100, w) * 0.985}%`,
                              height: '100%',
                              borderRadius: 999,
                              background: gAccent,
                              opacity: isActive ? 0.95 : 0.4,
                              transition: 'width .8s cubic-bezier(.22,1,.36,1), opacity .5s ease',
                            }}
                          />
                        </span>
                        <span style={{ width: 56, textAlign: 'right' }}>
                          <Roll value={w} color={isActive ? gAccent : 'var(--muted, #8a8f98)'} size={13.5} />
                        </span>
                      </div>
                    ))
                )}
              </button>
            )
          })}

          {/* write a goal — no copy buttons anywhere. you write, the mentor shapes it. */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              border: '1px dashed var(--border, #333)',
              borderRadius: 16,
              padding: '12px 14px',
              alignItems: 'center',
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addGoal()
              }}
              placeholder="Write a goal, raw — the mentor shapes it, weighs your tiles, and polishes the words."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--fg, #fff)',
                fontSize: 14,
                padding: '6px 4px',
              }}
            />
            <button
              type="button"
              onClick={addGoal}
              style={{
                flex: '0 0 auto',
                background: accent,
                color: '#0a0f0c',
                border: 'none',
                borderRadius: 999,
                padding: '9px 18px',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'background .8s ease',
              }}
            >
              Give it to the mentor
            </button>
          </div>
        </div>

        {/* ── noticed ── */}
        <div style={{ marginTop: 46 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <h2 style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontStyle: 'italic', fontWeight: 400, fontSize: 26, color: 'var(--fg, #fff)', margin: 0 }}>
              Noticed
            </h2>
            <span style={{ ...mono, fontSize: 10, color: 'var(--muted, #8a8f98)' }}>what the data whispered</span>
          </div>

          {feed.map((n) => (
            <div
              key={n.id}
              style={{
                marginTop: 14,
                border: '1px solid rgba(232,200,120,.28)',
                background: 'rgba(232,200,120,.05)',
                borderRadius: 16,
                padding: '16px 18px',
              }}
            >
              <p style={{ ...mono, fontSize: 10, color: '#E8C878', margin: '0 0 8px' }}>◈ {n.when}</p>
              <p style={{ margin: 0, color: 'var(--fg, #fff)', fontSize: 14.5, lineHeight: 1.65 }}>{n.text}</p>
              {n.deltas && n.deltas.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  {n.deltas.map((d) => (
                    <span
                      key={d.tile}
                      style={{
                        ...mono,
                        fontSize: 10.5,
                        letterSpacing: '.08em',
                        color: '#E8C878',
                        border: '1px solid rgba(232,200,120,.35)',
                        borderRadius: 999,
                        padding: '4px 10px',
                      }}
                    >
                      {label(d.tile)} {d.from}% → {d.to}%
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          <p style={{ marginTop: 16, color: 'var(--muted, #8a8f98)', fontSize: 12.5, lineHeight: 1.65 }}>
            The mentor thinks in <strong style={{ color: 'var(--fg, #fff)' }}>Claude Code</strong> — ask it anything, or let a
            scheduled sweep scan your tiles (workouts × water × analytics, day by day). When it finds a pattern it writes it
            here, retunes the percentages, and the numbers roll. No AI key in the app, ever.
          </p>
        </div>
      </div>
    </main>
  )
}
