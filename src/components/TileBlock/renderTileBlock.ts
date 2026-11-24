import type { Palette, Tile } from '@/domain/Bank/BattleSprites/graphics'
import { CHANNEL_LEVELS } from '@/utils/color'

export type CachedImage = {
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

export function renderTileBlockImage(
  tiles: Tile[],
  palette: Palette,
  layout: TileBlockLayout,
): CachedImage {
  const { cols, rows, grid } = layout

  const key = JSON.stringify({ tiles, palette, layout })
  const cached = imageCache.get(key)
  if (cached) {
    return cached
  }

  const canvas = document.createElement('canvas')
  canvas.width = cols * 8
  canvas.height = rows * 8
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    const blob = new Blob()
    const result = { blob, url: '' }
    imageCache.set(key, result)
    return result
  }

  const pal = palette.map((color) => {
    const r = CHANNEL_LEVELS[color[0]]
    const g = CHANNEL_LEVELS[color[1]]
    const b = CHANNEL_LEVELS[color[2]]
    return (255 << 24) | (b << 16) | (g << 8) | r
  })
  // Keep base color fully transparent
  pal[0] = 0

  const imageData = ctx.createImageData(canvas.width, canvas.height)
  const buf = new Uint32Array(imageData.data.buffer)

  for (let r = 0; r < grid.length; r++) {
    const row = grid[r]!
    for (let c = 0; c < row.length; c++) {
      const idx = row[c]!
      const tile = tiles[idx]
      if (!tile) continue
      const ox = c * 8
      const oy = r * 8
      const pixels = tile.pixels
      for (let py = 0; py < 8; py++) {
        for (let px = 0; px < 8; px++) {
          const colorIndex = pixels[px]![py]!
          buf[(oy + py) * canvas.width + (ox + px)] = pal[colorIndex]!
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)

  const dataUrl = canvas.toDataURL('image/png')
  const [, base64] = dataUrl.split(',')
  const bytes = Uint8Array.fromBase64(base64!)
  const blob = new Blob([bytes], { type: 'image/png' })
  const url = URL.createObjectURL(blob)
  const result = { blob, url }
  imageCache.set(key, result)
  return result
}
