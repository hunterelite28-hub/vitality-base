'use client'

/**
 * Publish sheet (Arts District v3). Confirms publishing a Kept tile to the public
 * gallery, credited to the maker's @handle. Gates on having a handle (links to
 * /account to claim one). On confirm it calls the publishTile server action,
 * which snapshots the tile into published_tiles as 'pending' (curated approval).
 * The cover reuses the tile's own design art, same as the dashboard + shop.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { designByKey } from '@/lib/tiles/designs'
import { publishTile } from './publishActions'
import type { Tile } from '@/lib/tiles/types'
import type { Skin } from '@/lib/tiles/tileSkin'
import styles from './publishSheet.module.css'

export interface PublishSheetProps {
  tile: Tile
  skin: Skin
  onClose: () => void
}

type Phase = 'loading' | 'ready' | 'no-handle' | 'submitting' | 'done'

export default function PublishSheet({ tile, skin, onClose }: PublishSheetProps) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [handle, setHandle] = useState<string | null>(null)
  const [optInReuse, setOptInReuse] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const name = (skin.name || tile.name).trim()
  const design = skin.design ? designByKey(skin.design) : undefined

  // On open, look up the maker's handle (credit requires one).
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { if (alive) setPhase('no-handle'); return }
        const { data } = await supabase
          .from('creator_profiles')
          .select('username')
          .eq('user_id', user.id)
          .maybeSingle()
        if (!alive) return
        if (data?.username) { setHandle(data.username); setPhase('ready') }
        else setPhase('no-handle')
      } catch {
        if (alive) setPhase('no-handle')
      }
    })()
    return () => { alive = false }
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit() {
    setError(null)
    setPhase('submitting')
    const res = await publishTile({ tile, skin, optInReuse })
    if (!res.ok) {
      if (res.needsHandle) { setPhase('no-handle'); return }
      setError(res.error ?? 'Could not publish. Try again.')
      setPhase('ready')
      return
    }
    setPhase('done')
  }

  return (
    <div className={styles.scrim} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.win} role="dialog" aria-modal="true" aria-label="Publish tile">
        <button type="button" className={styles.x} aria-label="Close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>

        {/* cover preview */}
        <div className={styles.cover} style={{ color: skin.color || undefined }}>
          {design && <span className={styles.art} dangerouslySetInnerHTML={{ __html: design.svg }} />}
          <span className={styles.coverName}>{name}</span>
        </div>

        {phase === 'done' ? (
          <div className={styles.body}>
            <h2 className={styles.title}>Sent for review</h2>
            <p className={styles.lede}>
              Nice. <b>{name}</b> is in the queue. Once it is approved it shows in the
              Arts District for anyone to add, credited to <b>@{handle}</b>.
            </p>
            <button type="button" className={styles.primary} onClick={onClose}>Done</button>
          </div>
        ) : phase === 'no-handle' ? (
          <div className={styles.body}>
            <h2 className={styles.title}>Claim a handle first</h2>
            <p className={styles.lede}>
              A published tile is credited to your maker handle. Claim one, then
              come back and publish.
            </p>
            <Link href="/account" className={styles.primary}>Claim your handle</Link>
          </div>
        ) : (
          <div className={styles.body}>
            <h2 className={styles.title}>Publish to the Arts District</h2>
            <p className={styles.lede}>
              Share <b>{name}</b> with everyone. It stays yours, credited
              {handle && <> to <b>@{handle}</b></>}, and is free for others to add.
            </p>

            <button
              type="button"
              className={styles.toggle}
              role="switch"
              aria-checked={optInReuse}
              onClick={() => setOptInReuse((v) => !v)}
            >
              <span className={`${styles.track} ${optInReuse ? styles.on : ''}`}>
                <span className={styles.knob} />
              </span>
              <span className={styles.toggleLabel}>Let others add this tile</span>
            </button>

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="button"
              className={styles.primary}
              onClick={submit}
              disabled={phase === 'submitting' || phase === 'loading'}
            >
              {phase === 'submitting' ? 'Publishing…' : 'Publish'}
            </button>
            <p className={styles.fine}>You and Liam approve every public tile before it goes live.</p>
          </div>
        )}
      </div>
    </div>
  )
}
