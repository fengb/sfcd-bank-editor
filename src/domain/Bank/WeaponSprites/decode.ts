import { chunk } from 'es-toolkit'

import { decodeStackGraphics } from '../BattleSprites/graphics'
import { extractEntries } from '../util'
import type WeaponSprites from './WeaponSprites'

const MAX_WEAPON_SPRITES = 64
// const SPRITE_BLOCK_SIZE = 0x4000 -- is this relevant?

export function decode(target: WeaponSprites, bytes: Uint8Array): boolean {
  target.sprites = []
  extractEntries(bytes, 0x10000 + bytes.byteOffset, MAX_WEAPON_SPRITES).forEach((block, i) => {
    const allTiles = decodeStackGraphics(block)!
    target.sprites.push({
      index: i,
      frames: chunk(allTiles, 64),
    })
  })
  return true
}
