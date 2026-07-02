import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

type Params = { params: { username: string } }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return { title: `@${params.username} · Vitality` }
}

/**
 * A maker's public page: their handle, bio, one link, and the tiles they've
 * published (approved ones). creator_profiles is public-read by design; only
 * approved published_tiles are visible to visitors (RLS).
 */
export default async function MakerPage({ params }: Params) {
  const supabase = createClient()
  const handle = params.username.toLowerCase()

  const { data: profile } = await supabase
    .from('creator_profiles')
    .select('user_id, username, display_name, bio, link_url')
    .eq('username', handle)
    .maybeSingle()

  if (!profile) notFound()

  const { data: tiles } = await supabase
    .from('published_tiles')
    .select('id, name, category')
    .eq('creator_id', profile.user_id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return (
    <main className="grain-overlay" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 'var(--space-8, 2rem)' }}>
      <div style={{ width: '100%', maxWidth: 640, display: 'grid', gap: 'var(--space-6, 1.5rem)', textAlign: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(2rem, 6vw, 3rem)', margin: 0 }}>
            {profile.display_name || `@${profile.username}`}
          </h1>
          {profile.display_name && (
            <div style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginTop: '0.3rem' }}>@{profile.username}</div>
          )}
          {profile.bio && (
            <p style={{ color: 'var(--muted)', maxWidth: 440, margin: '0.8rem auto 0', lineHeight: 1.6 }}>{profile.bio}</p>
          )}
          {profile.link_url && (
            <a href={profile.link_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--mint)', display: 'inline-block', marginTop: '0.8rem' }}>
              {profile.link_url.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>

        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.75rem' }}>
            Published tiles
          </div>
          {tiles && tiles.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.6rem' }}>
              {tiles.map((t) => (
                <li
                  key={t.id}
                  style={{
                    padding: '0.9rem 1.1rem',
                    borderRadius: '14px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-elevated)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{t.name}</span>
                  {t.category && <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{t.category}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--muted)', margin: 0 }}>No published tiles yet.</p>
          )}
        </div>

        <Link href="/app" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
          ← Back to the dashboard
        </Link>
      </div>
    </main>
  )
}
