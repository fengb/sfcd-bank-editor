import { decodeBattleData, type BattleDataRegions, type BattleSpriteSet } from './decode'

export default class BattleData {
  readonly data: BattleDataRegions | null
  readonly bytes: Uint8Array

  constructor(data: BattleDataRegions | null = null, bytes: Uint8Array = new Uint8Array()) {
    this.data = data
    this.bytes = bytes
  }

  static decode(bytes: Uint8Array): BattleData {
    return new BattleData(decodeBattleData(bytes), bytes)
  }

  get terrain(): number[] {
    return this.data?.terrain ?? []
  }

  get spriteset(): BattleSpriteSet {
    return this.data?.spriteset ?? { allies: [], enemies: [], aiRegions: [], aiPoints: [] }
  }

  get spritesetBis(): BattleSpriteSet {
    return this.data?.spritesetBis ?? { allies: [], enemies: [], aiRegions: [], aiPoints: [] }
  }
}
