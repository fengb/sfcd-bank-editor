import type { Palette, Tile } from '../BattleSprites/graphics'
import { decode } from './decode'

interface OverlayTile {
  tile: Tile
  target: number
}

export interface Portrait {
  index: number
  palette: Palette
  tiles: Tile[]
  baseTiles: Tile[]
  eyeTiles: OverlayTile[]
  mouthTiles: OverlayTile[]
}

export default class Portraits {
  portraits: Portrait[] = []

  private constructor() {}

  static decode(bytes: Uint8Array): Portraits | null {
    const r = new Portraits()
    try {
      if (!decode(r, bytes)) return null
    } catch {
      return null
    }
    return r
  }
}
