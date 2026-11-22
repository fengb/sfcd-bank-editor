import {
  decodeStackGraphics,
  parsePalette,
  type Palette,
  type Tile,
} from '../BattleSprites/graphics'
import { extractEntries, readRelative } from '../util'
import type Backgrounds from './Backgrounds'

const MAX_BACKGROUNDS = 64
const BACKGROUND_TILE_LENGTH = 384

export function decodeBackground(data: Uint8Array): { palette: Palette; tiles: Tile[] } | null {
  if (data.length < 6) return null

  const tileset1Offset = readRelative(data, 0)
  const tileset2Offset = readRelative(data, 2)
  const paletteOffset = readRelative(data, 4)

  if (
    tileset1Offset < 0 ||
    tileset2Offset < 0 ||
    paletteOffset < 0 ||
    paletteOffset + 32 > data.length
  ) {
    return null
  }

  const paletteData = data.subarray(paletteOffset)
  const palette = parsePalette(paletteData)

  const tileset1Data = data.subarray(tileset1Offset)
  const tileset2Data = data.subarray(tileset2Offset)

  const tileset1 = decodeStackGraphics(tileset1Data)
  const tileset2 = decodeStackGraphics(tileset2Data)
  if (!tileset1 || !tileset2) return null

  const tiles = [...tileset1, ...tileset2]
  if (tiles.length !== BACKGROUND_TILE_LENGTH) return null

  return { palette, tiles }
}

export function decode(target: Backgrounds, bytes: Uint8Array): boolean {
  target.backgrounds = []

  extractEntries(bytes, 0x10000 + bytes.byteOffset, MAX_BACKGROUNDS).forEach((entry, index) => {
    const decoded = decodeBackground(entry)
    if (!decoded) return

    target.backgrounds.push({
      index,
      palette: decoded.palette,
      tiles: decoded.tiles,
    })
  })

  return true
}
