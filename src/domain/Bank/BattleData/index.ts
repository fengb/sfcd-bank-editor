import { decodeBattleData, type BattleDataRegions, type BattleSpriteSet } from './decode'

export default class BattleData {
  readonly data: BattleDataRegions | null

  constructor(data: BattleDataRegions | null = null) {
    this.data = data
  }

  static decode(bytes: Uint8Array): BattleData {
    return new BattleData(decodeBattleData(bytes))
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
