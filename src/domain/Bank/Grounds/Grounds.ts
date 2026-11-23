import type { Tile } from '../BattleSprites'
import { decode } from './decode'

export interface GroundEntry {
  index: number
  paletteDelta: number[]
  tiles: Tile[]
}

export default class Grounds {
  entries: GroundEntry[] = []

  private constructor() {}

  static decode(bytes: Uint8Array): Grounds | null {
    const r = new Grounds()
    try {
      if (!decode(r, bytes)) return null
    } catch {
      return null
    }
    return r
  }
}
