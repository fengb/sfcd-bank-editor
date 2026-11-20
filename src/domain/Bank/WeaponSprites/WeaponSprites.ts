import type { Tile } from '../BattleSprites/graphics'
import { decode } from './decode'

export interface WeaponSprite {
  index: number
  frames: Tile[][]
}

export default class WeaponSprites {
  sprites: WeaponSprite[] = []

  private constructor() {}

  static decode(bytes: Uint8Array): WeaponSprites | null {
    const r = new WeaponSprites()
    try {
      if (!decode(r, bytes)) return null
    } catch {
      return null
    }
    return r
  }
}
