import type { Tile } from '../BattleSprites/graphics'
import { decodeMapTilesets, type MapTileset } from './decode'

export default class MapTilesets {
  constructor(readonly items: MapTileset) {}

  static decode(bytes: Uint8Array): MapTilesets {
    return new MapTilesets(decodeMapTilesets(bytes))
  }

  get tiles(): Tile[] {
    return this.items.tiles
  }
}
