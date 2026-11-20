import { decodeStackData } from '../BattleSprites/graphics'
import { ByteReader, extractSections, readU16be } from '../util'

const BATTLE_BASE = 0x236800

import type { BattleSpriteSet } from './BattleData'
import type BattleData from './BattleData'

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

export function decode(target: BattleData, data: Uint8Array): boolean {
  const sections = extractSections(data, BATTLE_BASE, {
    terrain: 0x00,
    sprintset: 0x04,
    sprintsetBis: 0x08,
  })

  target.terrain = decodeStackData(sections.terrain) ?? []
  target.spriteset = decodeSpriteSet(sections.sprintset)
  target.spritesetBis = decodeSpriteSet(sections.sprintsetBis)
  return true
}
