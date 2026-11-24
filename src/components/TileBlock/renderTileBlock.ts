import type { Palette, Tile } from '@/domain/Bank/BattleSprites/graphics'
import { paletteRgb } from '@/utils/color'

type CachedImage = {
  blob: Blob
  url: string
}

const imageCache = new Map<string, CachedImage>()

export type TileBlockLayout = {
  cols: number
  rows: number
  pixelWidth: number
  pixelHeight: number
}

export function parseTileBlockPattern(pattern: string): number[][] {
  return pattern.split(',').map((row) =>
    row
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((tok) => {
        if (tok === '--' || tok === '..') return -1
        const n = parseInt(tok, 16)
        return Number.isNaN(n) ? -1 : n
      }),
  )
}

export function computeTileBlockLayout(pattern: string): TileBlockLayout {
  const grid = parseTileBlockPattern(pattern)
  const rows = grid.length || 1
  const cols = grid.reduce((m, r) => Math.max(m, r.length), 0) || 1
  return { cols, rows, pixelWidth: cols * 8, pixelHeight: rows * 8 }
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return new Uint8Array(hash).toHex()
}

export async function renderTileBlockImage(
  tiles: Tile[],
  palette: Palette,
  pattern: string,
): Promise<string> {
  const { pixelWidth, pixelHeight } = computeTileBlockLayout(pattern)
  const grid = parseTileBlockPattern(pattern)

  const key = await sha256(JSON.stringify({ tiles, palette, pattern }))
  const cached = imageCache.get(key)
  if (cached) return cached.url

  const canvas = document.createElement('canvas')
  canvas.width = pixelWidth
  canvas.height = pixelHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  grid.forEach((row, r) => {
    row.forEach((idx, c) => {
      if (idx < 0) return
      const tile = tiles[idx]
      if (!tile) return
      const ox = c * 8
      const oy = r * 8
      for (let py = 0; py < 8; py++) {
        for (let px = 0; px < 8; px++) {
          const colorIndex = tile.pixels[px]?.[py] ?? 0
          if (colorIndex === 0) continue
          ctx.fillStyle = paletteRgb(palette[colorIndex])
          ctx.fillRect(ox + px, oy + py, 1, 1)
        }
      }
    })
  })

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result)
      else reject(new Error('canvas.toBlob returned null'))
    })
  })
  const url = URL.createObjectURL(blob)
  imageCache.set(key, { blob, url })
  return url
}
