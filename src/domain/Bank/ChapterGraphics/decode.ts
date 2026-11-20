import { decodeStackGraphics, parsePalette } from '../BattleSprites/graphics'
import type ChapterGraphics from './ChapterGraphics'

const TILE_DATA_OFFSET = 0x300
const METADATA_OFFSET = 0x20

export function decode(target: ChapterGraphics, data: Uint8Array): boolean {
  if (data.length < TILE_DATA_OFFSET + 32) return false

  const palette = parsePalette(data.subarray(0, METADATA_OFFSET))
  if (!palette?.length) return false
  const metadata = data.subarray(METADATA_OFFSET, TILE_DATA_OFFSET)
  const tiles = decodeStackGraphics(data.subarray(TILE_DATA_OFFSET))
  if (!tiles?.length) return false

  target.palette = palette
  target.tiles = tiles
  target.metadata = metadata
  return true
}
