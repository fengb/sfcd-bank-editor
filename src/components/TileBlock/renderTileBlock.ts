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

export function computeTileBlockLayout(
  tiles: Tile[],
  flow: 'columns' | 'rows',
  width?: number,
  height?: number,
): TileBlockLayout {
  let cols: number
  let rows: number
  if (flow === 'columns') {
    rows = height ?? tiles.length
    if (rows < 1) rows = 1
    cols = Math.ceil(tiles.length / rows)
    if (cols < 1) cols = 1
  } else {
    cols = width ?? tiles.length
    if (cols < 1) cols = 1
    rows = Math.ceil(tiles.length / cols)
    if (rows < 1) rows = 1
  }
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
  flow: 'columns' | 'rows',
  width?: number,
  height?: number,
): Promise<string> {
  const { cols, rows, pixelWidth, pixelHeight } = computeTileBlockLayout(tiles, flow, width, height)

  const key = await sha256(JSON.stringify({ tiles, palette, flow, cols, rows }))

  const cached = imageCache.get(key)
  if (cached) return cached.url

  const canvas = document.createElement('canvas')
  canvas.width = pixelWidth
  canvas.height = pixelHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  tiles.forEach((tile, index) => {
    const col = flow === 'columns' ? Math.floor(index / rows) : index % cols
    const row = flow === 'columns' ? index % rows : Math.floor(index / cols)
    const ox = col * 8
    const oy = row * 8
    for (let py = 0; py < 8; py++) {
      for (let px = 0; px < 8; px++) {
        const colorIndex = tile.pixels[px]?.[py] ?? 0
        if (colorIndex === 0) continue
        ctx.fillStyle = paletteRgb(palette[colorIndex])
        ctx.fillRect(ox + px, oy + py, 1, 1)
      }
    }
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
