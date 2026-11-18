import { decodeStackData } from '../BattleSprites/graphics'
import { ByteReader, extractSections, readU16be } from '../util'

const BATTLE_BASE = 0x236800

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

export interface BattleDataRegions {
  terrain: number[]
  spriteset: BattleSpriteSet
  spritesetBis: BattleSpriteSet

  bytes: Uint8Array
}

export function decodeSpriteSet(data: Uint8Array): BattleSpriteSet {
  const reader = new ByteReader(data)

  const alliesNumber = reader.nextU8()
  const enemiesNumber = reader.nextU8()
  const aiRegionsNumber = reader.nextU8()
  const aiPointsNumber = reader.nextU8()

  const allies = Array.from({ length: alliesNumber }, () => {
    const entry = reader.nextBytes(12)
    return {
      index: entry[0] ?? 0,
      x: entry[1] ?? 0,
      y: entry[2] ?? 0,
      unknown: entry.slice(3),
    }
  })

  const enemies = Array.from({ length: enemiesNumber }, () => {
    const entry = reader.nextBytes(12)
    return {
      index: entry[0] ?? 0,
      x: entry[1] ?? 0,
      y: entry[2] ?? 0,
      ai: entry[3] ?? 0,
      item: readU16be(entry, 4),
      moveOrder: entry[6] ?? 0,
      triggerRegion: entry[7] ?? 0,
      byte8: entry[8] ?? 0,
      byte9: entry[9] ?? 0,
      byte10: entry[10] ?? 0,
      spawnParams: entry[11] ?? 0,
    }
  })

  const aiRegions = Array.from({ length: aiRegionsNumber }, () => {
    const entry = reader.nextBytes(12)
    return {
      type: entry[0] ?? 0,
      x1: entry[2] ?? 0,
      y1: entry[3] ?? 0,
      x2: entry[4] ?? 0,
      y2: entry[5] ?? 0,
      x3: entry[6] ?? 0,
      y3: entry[7] ?? 0,
      x4: entry[8] ?? 0,
      y4: entry[9] ?? 0,
      unknown: entry.slice(10),
    }
  })

  const aiPoints = Array.from({ length: aiPointsNumber }, () => {
    const entry = reader.nextBytes(2)
    return {
      x: entry[0] ?? 0,
      y: entry[1] ?? 0,
    }
  })

  return { allies, enemies, aiRegions, aiPoints }
}

export function decodeBattleData(data: Uint8Array): BattleDataRegions | null {
  try {
    const sections = extractSections(data, BATTLE_BASE, {
      terrain: 0x00,
      sprintset: 0x04,
      sprintsetBis: 0x08,
    })

    return {
      terrain: decodeStackData(sections.terrain) ?? [],
      spriteset: decodeSpriteSet(sections.sprintset),
      spritesetBis: decodeSpriteSet(sections.sprintsetBis),
      bytes: data,
    }
  } catch {
    return null
  }
}
