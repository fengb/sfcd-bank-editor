import { decodeStackData } from '../BattleSprites/graphics'
import { readU16be, readU32be } from '../util'

const BATTLE_BASE = 0x236800

export interface BattleAlly {
  index: number
  x: number
  y: number
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
  terrainPointer: number
  spritesetPointer: number
  spritesetBisPointer: number

  terrain: Uint8Array
  spriteset: BattleSpriteSet
  spritesetBis: BattleSpriteSet

  bytes: Uint8Array
}

function resolvePointer(data: Uint8Array, pointer: number): number {
  const offset = pointer - BATTLE_BASE
  if (offset < 0 || offset >= data.length) return -1
  return offset
}

export function decodeSpriteSet(data: Uint8Array): BattleSpriteSet {
  const result: BattleSpriteSet = { allies: [], enemies: [], aiRegions: [], aiPoints: [] }
  if (data.length < 4) return result

  const alliesNumber = data[0]!
  const enemiesNumber = data[1]!
  const aiRegionsNumber = data[2]!
  const aiPointsNumber = data[3]!

  let cursor = 4
  for (let i = 0; i < alliesNumber; i++) {
    result.allies.push({
      index: data[cursor + 0] ?? 0,
      x: data[cursor + 1] ?? 0,
      y: data[cursor + 2] ?? 0,
    })
    cursor += 12
  }

  const enemyStart = 4 + alliesNumber * 12
  cursor = enemyStart
  for (let i = 0; i < enemiesNumber; i++) {
    result.enemies.push({
      index: data[cursor + 0] ?? 0,
      x: data[cursor + 1] ?? 0,
      y: data[cursor + 2] ?? 0,
      ai: data[cursor + 3] ?? 0,
      item: readU16be(data, cursor + 4),
      moveOrder: data[cursor + 6] ?? 0,
      triggerRegion: data[cursor + 7] ?? 0,
      byte8: data[cursor + 8] ?? 0,
      byte9: data[cursor + 9] ?? 0,
      byte10: data[cursor + 10] ?? 0,
      spawnParams: data[cursor + 11] ?? 0,
    })
    cursor += 12
  }

  const regionStart = 4 + alliesNumber * 12 + enemiesNumber * 12
  cursor = regionStart
  for (let i = 0; i < aiRegionsNumber; i++) {
    result.aiRegions.push({
      type: data[cursor + 0] ?? 0,
      x1: data[cursor + 2] ?? 0,
      y1: data[cursor + 3] ?? 0,
      x2: data[cursor + 4] ?? 0,
      y2: data[cursor + 5] ?? 0,
      x3: data[cursor + 6] ?? 0,
      y3: data[cursor + 7] ?? 0,
      x4: data[cursor + 8] ?? 0,
      y4: data[cursor + 9] ?? 0,
    })
    cursor += 12
  }

  const pointStart = 4 + alliesNumber * 12 + enemiesNumber * 12 + aiRegionsNumber * 12
  cursor = pointStart
  for (let i = 0; i < aiPointsNumber; i++) {
    result.aiPoints.push({
      x: data[cursor + 0] ?? 0,
      y: data[cursor + 1] ?? 0,
    })
    cursor += 2
  }

  return result
}

export function decodeBattleData(data: Uint8Array): BattleDataRegions | null {
  try {
    if (!data || data.length < 12) return null

    const terrainPointer = readU32be(data, 0) ?? 0
    const spritesetPointer = readU32be(data, 4) ?? 0
    const spritesetBisPointer = readU32be(data, 8) ?? 0

    const terrainOffset = resolvePointer(data, terrainPointer)
    const terrain = new Uint8Array(decodeStackData(data.subarray(terrainOffset)) ?? [])

    const spritesetOffset = resolvePointer(data, spritesetPointer)
    const spriteset =
      spritesetOffset >= 0
        ? decodeSpriteSet(data.subarray(spritesetOffset))
        : { allies: [], enemies: [], aiRegions: [], aiPoints: [] }

    const spritesetBisOffset = resolvePointer(data, spritesetBisPointer)
    const spritesetBis =
      spritesetBisOffset >= 0
        ? decodeSpriteSet(data.subarray(spritesetBisOffset))
        : { allies: [], enemies: [], aiRegions: [], aiPoints: [] }

    return {
      terrainPointer,
      spritesetPointer,
      spritesetBisPointer,
      terrain,
      spriteset,
      spritesetBis,
      bytes: data,
    }
  } catch {
    return null
  }
}
