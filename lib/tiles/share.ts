import type { Tile, TileEnvelope } from './types'
import type { Skin } from './tileSkin'

/**
 * Tile sharing (Arts District v1). A tile is already a self-contained TileEnvelope,
 * so "share with a friend" is pure client work: pack the envelope into one opaque,
 * paste-safe code. The friend pastes it into "Add a tile" and it installs through
 * the LOCKED tileStore.importTile, exactly like a built or uploaded tile. No
 * backend, no accounts, and it cannot break the locked contract (it only consumes
 * it). See docs/superpowers/specs/2026-06-30-arts-district-social-platform-design.md.
 */

const PREFIX = 'vitality:tile:'

/** UTF-8 safe base64url (a tile's html is arbitrary text), with padding stripped. */
function b64urlEncode(s: string): string {
  const b64 = btoa(unescape(encodeURIComponent(s)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function b64urlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad
  return decodeURIComponent(escape(atob(b64)))
}

/**
 * Fold a Kept tile + its current skin into a TileEnvelope (the canonical payload
 * importTile consumes). Single source of truth so sharing (v1) and publishing
 * (v3) build the exact same shape and can never diverge.
 */
export function tileToEnvelope(tile: Tile, skin: Skin): TileEnvelope {
  const env: TileEnvelope = {
    name: (skin.name || tile.name).trim(),
    html: tile.html,
  }
  if (tile.category) env.category = tile.category
  // The tile's declared stream (report contract) travels WITH the tile: a
  // shared/published beer tile must keep kind:'intake' + goalDirection:'down',
  // or the installer's copy silently flips scoring mode (PATCH21).
  if (tile.key) env.key = tile.key
  if (tile.label) env.label = tile.label
  if (tile.kind) env.kind = tile.kind
  if (tile.goalDirection) env.goalDirection = tile.goalDirection
  if (skin.design) env.design = skin.design
  if (skin.color) env.color = skin.color
  if (skin.size) env.size = skin.size
  return env
}

/** Pack a Kept tile (its current skin folded in) into a shareable code. */
export function exportTileCode(tile: Tile, skin: Skin): string {
  return PREFIX + b64urlEncode(JSON.stringify(tileToEnvelope(tile, skin)))
}

/**
 * Parse a pasted share code back into an envelope, or null if it is not one (so the
 * caller can fall through to plain JSON / raw HTML). Validates the same minimum the
 * importTile pipe needs: a non-empty name and html.
 */
export function parseTileCode(text: string): TileEnvelope | null {
  const t = (text || '').trim()
  if (!t.startsWith(PREFIX)) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(b64urlDecode(t.slice(PREFIX.length)))
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== 'object') return null
  const e = parsed as TileEnvelope
  if (typeof e.name !== 'string' || e.name.trim().length === 0) return null
  if (typeof e.html !== 'string' || e.html.trim().length === 0) return null
  return e
}

/** True when a pasted string looks like a tile share code (cheap prefix check). */
export function isTileCode(text: string): boolean {
  return (text || '').trim().startsWith(PREFIX)
}
