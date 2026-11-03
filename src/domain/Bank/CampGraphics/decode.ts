import {
  decodeStackGraphics,
  parsePalette,
  type Tile,
  type Palette,
} from '../BattleSprites/graphics'
import { readU32be } from '../util'

export interface CampGraphic {
  palettes: Palette[]
  tilesets: Tile[][]
}

const PALETTE_OFFSET = 0x18
const PALETTE_SIZE = 0x20
const TILE_DATA_OFFSET = 0x98

export function decodeCampGraphic(data: Uint8Array): CampGraphic | null {
  try {
    if (data.length < TILE_DATA_OFFSET + 32) return null

    const base = readU32be(data, 0)
    if (base === null) return null

    const palettes = Array.from({ length: 4 }, (_, i) =>
      parsePalette(
        data.subarray(PALETTE_OFFSET + i * PALETTE_SIZE, PALETTE_OFFSET + (i + 1) * PALETTE_SIZE),
      ),
    )

    const tilesets = Array.from({ length: 4 }, (_, i) => {
      const offset = readU32be(data, 0x04 * (i + 1))! - base + PALETTE_OFFSET
      return decodeStackGraphics(data.subarray(offset))!
    })
    if (tilesets.some((t) => !t)) {
      return null
    }

    return {
      palettes,
      tilesets,
    }
  } catch {
    return null
  }
}
