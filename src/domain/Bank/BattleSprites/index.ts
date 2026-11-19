import { decodeBattleSprites, type BattleSprite } from './decode'

export { type BattleSprite }
export { decodeBattleSprites }
export * from './decode'
export * from './graphics'

export default class BattleSprites {
  readonly sprites: BattleSprite[]

  constructor(sprites: BattleSprite[] = []) {
    this.sprites = sprites
  }

  static decode(bytes: Uint8Array): BattleSprites {
    return new BattleSprites(decodeBattleSprites(bytes))
  }
}
