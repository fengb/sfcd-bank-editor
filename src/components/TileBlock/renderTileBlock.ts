import type { Palette, Tile } from '@/domain/Bank/BattleSprites/graphics'
import { paletteRgb } from '@/utils/color'

type CachedImage = {
  blob: Blob
  url: string
}

const imageCache = new Map<string, CachedImage>()

export type TileBlockLayout = {
  grid: number[][]
  cols: number
  rows: number
}

export function parseTileBlockLayout(layout: string | string[]): TileBlockLayout {
  const rows = Array.isArray(layout) ? layout : layout.split(',')
  const grid = rows.map((row) =>
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
  const rowCount = grid.length || 1
  const colCount = grid.reduce((m, r) => Math.max(m, r.length), 0) || 1
  return {
    grid,
    cols: colCount,
    rows: rowCount,
  }
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return new Uint8Array(hash).toHex()
}

export async function renderTileBlockImage(
  tiles: Tile[],
  palette: Palette,
  layout: TileBlockLayout,
): Promise<string> {
  const { cols, rows, grid } = layout

  const key = await sha256(JSON.stringify({ tiles, palette, layout }))
  const cached = imageCache.get(key)
  if (cached) return cached.url

  const canvas = document.createElement('canvas')
  canvas.width = cols * 8
  canvas.height = rows * 8
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
