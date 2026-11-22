import type { Palette, Tile } from '../BattleSprites/graphics'
import { decode } from './decode'

export interface Background {
  index: number
  palette: Palette
  tiles: Tile[]
}

export default class Backgrounds {
  backgrounds: Background[] = []

  private constructor() {}

  static decode(bytes: Uint8Array): Backgrounds | null {
    const r = new Backgrounds()
    try {
      if (!decode(r, bytes)) return null
    } catch {
      return null
    }
    return r
  }
}
