import { chunk } from 'es-toolkit'

import { decodeStackGraphics, type Tile } from '../BattleSprites/graphics'
import { extractEntries } from '../util'

export interface WeaponSprite {
  index: number
  frames: Tile[][]
}

const MAX_WEAPON_SPRITES = 64
// const SPRITE_BLOCK_SIZE = 0x4000 -- is this relevant?

export function decodeWeaponSprites(bytes: Uint8Array): WeaponSprite[] {
  return extractEntries(bytes, 0x10000 + bytes.byteOffset, MAX_WEAPON_SPRITES).map((block, i) => {
    const allTiles = decodeStackGraphics(block)!
    return {
      index: i,
      frames: chunk(allTiles, 64),
    }
  })
}
