import { chunk } from 'es-toolkit'

import { decodeStackGraphics, type Tile } from '../BattleSprites/graphics'
import { readU32be } from '../util'

export interface WeaponSprite {
  index: number
  frames: Tile[][]
}

const MAX_WEAPON_SPRITES = 64
const SPRITE_BLOCK_SIZE = 0x4000

export function decodeWeaponSprites(bytes: Uint8Array): WeaponSprite[] {
  const offsets: number[] = []
  for (let i = 0; i < MAX_WEAPON_SPRITES; i++) {
    const entryOffset = i * 4
    if (entryOffset + 4 > bytes.length) break

    const pointer = readU32be(bytes, entryOffset)
    if (!pointer) break

    const regionOffset = pointer - 0x10000 - bytes.byteOffset
    if (regionOffset < 0 || regionOffset >= bytes.length) break

    if (regionOffset <= offsets.at(-1)!) break

    offsets.push(regionOffset)
  }

  const result: WeaponSprite[] = []
  for (let i = 0; i < offsets.length; i++) {
    const regionOffset = offsets[i]!
    const block = bytes.subarray(regionOffset, regionOffset + SPRITE_BLOCK_SIZE)

    const tiles = decodeStackGraphics(block)
    if (!tiles?.length) break

    result.push({ index: i, frames: chunk(tiles, 64) })
  }

  return result
}
