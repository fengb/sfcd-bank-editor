import type { Tile } from '../BattleSprites/graphics'
import { decode } from './decode'

export interface MapSprite {
  index: number
  frames: [Tile[], Tile[]]
}

export default class MapSprites {
  sprites: MapSprite[] = []

  private constructor() {}

  static decode(bytes: Uint8Array): MapSprites | null {
    const r = new MapSprites()
    try {
      if (!decode(r, bytes)) return null
    } catch {
      return null
    }
    return r
  }
}
