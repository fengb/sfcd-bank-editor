import { decode } from './decode'

// Battle data types
export interface BattleAlly {
  index: number
  x: number
  y: number
  unknown: number[]
}

export interface BattleEnemy {
  index: number
  x: number
  y: number
  ai: number
  item: number
  moveOrder: number
  triggerRegion: number
  byte8: number
  byte9: number
  byte10: number
  spawnParams: number
}

export interface BattleAIRegion {
  type: number
  x1: number
  y1: number
  x2: number
  y2: number
  x3: number
  y3: number
  x4: number
  y4: number
  unknown: number[]
}

export interface BattleAIPoint {
  x: number
  y: number
}

export interface BattleSpriteSet {
  allies: BattleAlly[]
  enemies: BattleEnemy[]
  aiRegions: BattleAIRegion[]
  aiPoints: BattleAIPoint[]
}

export default class BattleData {
  terrain: number[] = []
  spriteset: BattleSpriteSet = { allies: [], enemies: [], aiRegions: [], aiPoints: [] }
  spritesetBis: BattleSpriteSet = { allies: [], enemies: [], aiRegions: [], aiPoints: [] }

  private constructor() {}

  static decode(bytes: Uint8Array): BattleData | null {
    const r = new BattleData()
    try {
      if (!decode(r, bytes)) return null
    } catch {
      return null
    }
    return r
  }
}
