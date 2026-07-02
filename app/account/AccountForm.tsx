'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { saveMakerProfile } from './actions'

type Profile = {
  username?: string | null
  display_name?: string | null
  bio?: string | null
  link_url?: string | null
}

const field: React.CSSProperties = {
  width: '100%',
  padding: '0.7rem 0.9rem',
  borderRadius: '12px',
  border: '1px solid var(--border)',
  background: 'var(--bg-elevated)',
  color: 'var(--fg)',
  fontSize: '1rem',
}
const labelStyle: React.CSSProperties = {
  display: 'grid',
  gap: '0.4rem',
  fontSize: '0.85rem',
  color: 'var(--muted)',
  textAlign: 'left',
}

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        padding: '0.7rem 1.4rem',
        borderRadius: 'var(--radius-pill, 999px)',
        background: 'var(--mint)',
        color: 'var(--mint-ink, #042a1c)',
        fontWeight: 600,
        border: 'none',
        cursor: pending ? 'default' : 'pointer',
        opacity: pending ? 0.7 : 1,
      }}
    >
      {pending ? 'Saving…' : 'Save profile'}
    </button>
  )
}

export default function AccountForm({ profile }: { profile: Profile | null }) {
  const [state, action] = useFormState(saveMakerProfile, null)
  return (
    <form action={action} style={{ display: 'grid', gap: '1rem', maxWidth: 460, margin: '0 auto', textAlign: 'left' }}>
      <label style={labelStyle}>
        Handle
        <input
          name="username"
          defaultValue={profile?.username ?? ''}
          placeholder="yourname"
          autoComplete="off"
          style={field}
          required
        />
      </label>
      <label style={labelStyle}>
        Display name (optional)
        <input name="display_name" defaultValue={profile?.display_name ?? ''} style={field} />
      </label>
      <label style={labelStyle}>
        Bio (optional)
        <textarea name="bio" defaultValue={profile?.bio ?? ''} rows={3} maxLength={240} style={{ ...field, resize: 'vertical' }} />
      </label>
      <label style={labelStyle}>
        Your one link (optional)
        <input name="link_url" defaultValue={profile?.link_url ?? ''} placeholder="https://…" style={field} />
      </label>

      {state?.error && <p style={{ color: 'var(--red, #EF4444)', margin: 0, fontSize: '0.9rem' }}>{state.error}</p>}
      {state?.ok && (
        <p style={{ color: 'var(--mint)', margin: 0, fontSize: '0.9rem' }}>
          Saved.{' '}
          <Link href={`/u/${state.username ?? profile?.username ?? ''}`} style={{ color: 'var(--mint)' }}>
            View your page →
          </Link>
        </p>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <SaveButton />
        <Link href="/app" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
          Back to dashboard
        </Link>
      </div>
    </form>
  )
}
