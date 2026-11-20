import { decode } from './decode'
import type { Palette, Tile } from './graphics'

export interface BattleSprite {
  index: number
  animSpeed: number
  unknown: number
  palettes: Palette[]
  frames: Tile[][]
}

export type DecodedBattleSprite = {
  animSpeed: number
  unknown: number
  palettes: Palette[]
  frames: Tile[][]
}

export default class BattleSprites {
  sprites: BattleSprite[] = []

  private constructor() {}

  static decode(bytes: Uint8Array): BattleSprites | null {
    const r = new BattleSprites()
    try {
      if (!decode(r, bytes)) return null
    } catch {
      return null
    }
    return r
  }
}
