import type { Tile } from '../BattleSprites/graphics'
import { decodeMapTilesets, type MapTileset } from './decode'

export default class MapTilesets {
  constructor(readonly items: MapTileset[]) {}

  static decode(bytes: Uint8Array): MapTilesets {
    return new MapTilesets(decodeMapTilesets(bytes))
  }

  get tilesets(): Tile[][] {
    return this.items.map((item) => item.tiles)
  }

  get count(): number {
    return this.items.length
  }

  get tiles(): Tile[] {
    return this.items.flatMap((item) => item.tiles)
  }
}
