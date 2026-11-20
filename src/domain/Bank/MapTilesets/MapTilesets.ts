import type { Tile } from '../BattleSprites/graphics'
import { decode } from './decode'

export default class MapTilesets {
  tiles: Tile[] = []

  private constructor() {}

  static decode(bytes: Uint8Array): MapTilesets | null {
    const r = new MapTilesets()
    try {
      if (!decode(r, bytes)) return null
    } catch {
      return null
    }
    return r
  }
}
