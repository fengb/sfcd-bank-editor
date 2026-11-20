import { convertTiles, parsePalette, type Palette } from '../BattleSprites/graphics'
import type Icons from './Icons'

const ICON_PALETTE_BYTES = new Uint8Array([
  0x00, 0x00, 0x0e, 0xee, 0x00, 0x00, 0x04, 0x44, 0x08, 0x88, 0x04, 0xa0, 0x0c, 0x64, 0x04, 0x8e,
  0x0a, 0xce, 0x08, 0x4e, 0x02, 0x2c, 0x04, 0xce, 0x00, 0x48, 0x00, 0x24, 0x02, 0x60, 0x08, 0x20,
])

export const ICON_PALETTE: Palette = parsePalette(ICON_PALETTE_BYTES)

export function decode(target: Icons, data: Uint8Array): boolean {
  if (data.length < 32) return false

  const tiles = convertTiles([...data])
  if (!tiles?.length) return false

  target.palette = ICON_PALETTE
  target.tiles = tiles
  return true
}
