import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Starter tile · Vitality',
}

/**
 * The landing spot for the "poster" core tiles (Fuel, Vitals, Peak, Brand,
 * Finance, Vee). In the base model those tiles ship as the locked aesthetic —
 * they're placeholders you replace with your own sealed HTML tile. This page
 * explains that and points back to the Library, where you build/add tiles.
 */
export default function StarterPage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--space-8, 2rem)',
        textAlign: 'center',
      }}
      className="grain-overlay"
    >
      <div style={{ maxWidth: 560, display: 'grid', gap: 'var(--space-5, 1.25rem)' }}>
        <div
          aria-hidden
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--mint)',
          }}
        >
          Starter tile
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(2rem, 6vw, 3rem)',
            lineHeight: 1.05,
            margin: 0,
          }}
        >
          Build your own to replace it
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>
          This is one of the placeholder tiles that ship with the base — the look is
          set, the content is yours. Open the <strong style={{ color: 'var(--fg)' }}>Library</strong> on
          your dashboard (the <span style={{ color: 'var(--mint)' }}>＋</span> shelf) to build a new
          sealed tile or paste one in, and it takes a place on the grid right next to Train.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3, 0.75rem)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/app"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.4rem',
              borderRadius: 'var(--radius-pill, 999px)',
              background: 'var(--mint)',
              color: 'var(--mint-ink, #042a1c)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Back to dashboard
          </Link>
          <Link
            href="/app/fitness/log"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.4rem',
              borderRadius: 'var(--radius-pill, 999px)',
              border: '1px solid var(--border)',
              color: 'var(--fg)',
              textDecoration: 'none',
            }}
          >
            Open the workout logger →
          </Link>
        </div>
      </div>
    </main>
  )
}
