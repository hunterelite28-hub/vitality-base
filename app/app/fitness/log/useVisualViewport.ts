'use client'

import { useEffect, useState } from 'react'

/** The visible band above the on-screen keyboard. */
export interface ViewportBand {
  height: number
  offsetTop: number
}

/**
 * Track window.visualViewport so a bottom/centered modal can be pinned to the
 * band of screen that's actually visible above the iOS keyboard. On iOS the
 * keyboard does NOT shrink the layout viewport, so any vh-sized sheet spills
 * behind the keyboard; binding a backdrop's height/top to this fixes it.
 *
 * Returns null until measured (SSR / no visualViewport) — callers fall back to
 * a CSS default (e.g. 100dvh) in that case.
 */
export function useVisualViewport(): ViewportBand | null {
  const [band, setBand] = useState<ViewportBand | null>(null)
  useEffect(() => {
    const view = window.visualViewport
    if (!view) return
    const update = () => setBand({ height: view.height, offsetTop: view.offsetTop })
    update()
    view.addEventListener('resize', update)
    view.addEventListener('scroll', update)
    return () => {
      view.removeEventListener('resize', update)
      view.removeEventListener('scroll', update)
    }
  }, [])
  return band
}
