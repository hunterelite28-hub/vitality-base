import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AccountForm from './AccountForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your profile · Vitality',
}

export default async function AccountPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('creator_profiles')
    .select('username, display_name, bio, link_url')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <main
      className="grain-overlay"
      style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 'var(--space-8, 2rem)' }}
    >
      <div style={{ width: '100%', maxWidth: 520, display: 'grid', gap: 'var(--space-5, 1.25rem)', textAlign: 'center' }}>
        <div>
          <div
            aria-hidden
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--mint)',
            }}
          >
            Maker profile
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', margin: '0.3rem 0 0' }}>
            {profile?.username ? `@${profile.username}` : 'Claim your handle'}
          </h1>
          <p style={{ color: 'var(--muted)', margin: '0.5rem 0 0', fontSize: '0.95rem', lineHeight: 1.5 }}>
            Your handle is your byline when you publish a tile, and the address of your public page at <code>/u/&lt;handle&gt;</code>.
          </p>
        </div>
        <AccountForm profile={profile ?? null} />
      </div>
    </main>
  )
}
