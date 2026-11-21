import type { Palette, Tile } from '../BattleSprites/graphics'
import { decode } from './decode'

export default class HqGraphics {
  palettes: Palette[] = []
  camp: Tile[] = []
  noShop: Tile[] = []
  shop: Tile[] = []
  text: Tile[] = []

  private constructor() {}

  static decode(bytes: Uint8Array): HqGraphics | null {
    const r = new HqGraphics()
    try {
      if (!decode(r, bytes)) return null
    } catch {
      return null
    }
    return r
  }
}
