import { convertTiles, parsePalette, type Tile, type Palette } from '../BattleSprites/graphics'

export interface Icon {
  palette: Palette
  tiles: Tile[]
}

const ICON_PALETTE_BYTES = new Uint8Array([
  0x00, 0x00, 0x0e, 0xee, 0x00, 0x00, 0x04, 0x44, 0x08, 0x88, 0x04, 0xa0, 0x0c, 0x64, 0x04, 0x8e,
  0x0a, 0xce, 0x08, 0x4e, 0x02, 0x2c, 0x04, 0xce, 0x00, 0x48, 0x00, 0x24, 0x02, 0x60, 0x08, 0x20,
])

export const ICON_PALETTE: Palette = parsePalette(ICON_PALETTE_BYTES)

export function decodeIcons(data: Uint8Array): Icon | null {
  if (data.length < 32) return null

  const tiles = convertTiles([...data])
  if (!tiles?.length) return null

  return { palette: ICON_PALETTE, tiles }
}
