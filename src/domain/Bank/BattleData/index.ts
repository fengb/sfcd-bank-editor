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

  get terrainPointer(): number {
    return this.data?.terrainPointer ?? 0
  }

  get spritesetPointer(): number {
    return this.data?.spritesetPointer ?? 0
  }

  get spritesetBisPointer(): number {
    return this.data?.spritesetBisPointer ?? 0
  }

  get terrain(): Uint8Array {
    return this.data?.terrain ?? new Uint8Array()
  }

  get terrainBytes(): Uint8Array {
    return this.terrain
  }

  get spriteset(): BattleSpriteSet {
    return this.data?.spriteset ?? { allies: [], enemies: [], aiRegions: [], aiPoints: [] }
  }

  get spritesetBis(): BattleSpriteSet {
    return this.data?.spritesetBis ?? { allies: [], enemies: [], aiRegions: [], aiPoints: [] }
  }

  get graphic(): BattleDataRegions | null {
    return this.data
  }
}
