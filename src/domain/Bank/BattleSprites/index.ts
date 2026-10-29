import { decodeBattleSprites, type BattleSprite } from './decode'

export { type BattleSprite }
export { decodeBattleSprites }
export * from './decode'
export * from './graphics'

export default class BattleSprites {
  readonly sprites: BattleSprite[]
  readonly bytes: Uint8Array

  constructor(sprites: BattleSprite[] = [], bytes: Uint8Array = new Uint8Array()) {
    this.sprites = sprites
    this.bytes = bytes
  }

  static decode(bytes: Uint8Array): BattleSprites {
    return new BattleSprites(decodeBattleSprites(bytes), bytes)
  }
}
