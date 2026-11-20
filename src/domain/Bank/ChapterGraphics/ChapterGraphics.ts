import type { Palette, Tile } from '../BattleSprites/graphics'
import { decode } from './decode'

export default class ChapterGraphics {
  palette: Palette | null = null
  tiles: Tile[] = []
  metadata: Uint8Array = new Uint8Array()

  private constructor() {}

  static decode(bytes: Uint8Array): ChapterGraphics | null {
    const r = new ChapterGraphics()
    try {
      if (!decode(r, bytes)) return null
    } catch {
      return null
    }
    return r
  }
}
