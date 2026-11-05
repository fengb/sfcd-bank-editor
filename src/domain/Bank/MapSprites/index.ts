import { type Palette, type Tile } from '../BattleSprites/graphics'
import { decodeMapSprites, MAP_SPRITE_PALETTE, type MapSprite } from './decode'

export default class MapSprites {
  readonly sprites: MapSprite[]
  readonly bytes: Uint8Array

  constructor(sprites: MapSprite[] = [], bytes: Uint8Array = new Uint8Array()) {
    this.sprites = sprites
    this.bytes = bytes
  }

  static decode(bytes: Uint8Array): MapSprites {
    return new MapSprites(decodeMapSprites(bytes), bytes)
  }

  get items(): MapSprite[] {
    return this.sprites
  }

  get mapsprites(): MapSprite[] {
    return this.sprites
  }

  get count(): number {
    return this.sprites.length
  }

  get palette(): Palette {
    return MAP_SPRITE_PALETTE
  }

  get palettes(): Palette[] {
    return [MAP_SPRITE_PALETTE]
  }

  get frames(): [Tile[], Tile[]][] {
    return this.sprites.map((sprite) => sprite.frames)
  }

  get tiles(): Tile[] {
    return this.sprites.flatMap((sprite) => sprite.frames.flat())
  }
}
