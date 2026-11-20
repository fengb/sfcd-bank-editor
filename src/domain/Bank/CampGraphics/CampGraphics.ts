import type { Palette, Tile } from '../BattleSprites/graphics'
import { decode } from './decode'

export default class CampGraphics {
  palettes: Palette[] = []
  tilesets: Tile[][] = []

  private constructor() {}

  static decode(bytes: Uint8Array): CampGraphics | null {
    const r = new CampGraphics()
    try {
      if (!decode(r, bytes)) return null
    } catch {
      return null
    }
    return r
  }
}
