import { chunk, chunkBy } from 'es-toolkit'

import { decodeSegments } from '../util'

const SECONDARY_ENTRY_SIZE = 6
const CLASS_ENTRY_SIZE = 5

export type StatPair = { growth: number; value: number }

export type SpellLearn = { level: number; spell: number }

export type CharacterRecord = {
  heroId: number
  classId: number
  stats: { hp: StatPair; mp: StatPair; att: StatPair; def: StatPair; agi: StatPair }
  /** Spell tail after the five stat pairs: [level, spell] until the terminator. */
  spells: SpellLearn[]
  /** FF for normal records; FE for the candidate level-cap stat records. */
  terminator: number
}

export type SecondaryEntry = {
  heroId: number
  classId: number
  level: number
  unknown: [number, number, number, number]
}

export type ClassEntry = {
  classId: number
  mov: number
  unitClass: number
  unknown04: number
}

export type CharacterTables = {
  records: CharacterRecord[]
  secondary: SecondaryEntry[]
  classes: ClassEntry[]
}

function statPair(data: number[], at: number): StatPair {
  return { growth: data[at]!, value: data[at + 1]! }
}

function iterPair<T>(array: T[]): [T, T][] {
  return chunk(array, 2) as [T, T][]
}

function decodeRecords(bytes: Uint8Array): CharacterRecord[] {
  const grouped = chunkBy([...bytes], (byte) => byte === 0xff || byte === 0xfe)
  return iterPair(grouped).map(([entry, separators], i) => {
    return {
      heroId: Math.floor(i / 2),
      classId: entry[0]!,
      stats: {
        hp: statPair(entry, 1),
        mp: statPair(entry, 3),
        att: statPair(entry, 5),
        def: statPair(entry, 7),
        agi: statPair(entry, 9),
      },
      spells: iterPair(entry.slice(11)).map(([level, spell]) => ({
        level: level,
        spell: spell,
      })),
      terminator: separators![0]!,
    }
  })
}

function decodeSecondary(bytes: Uint8Array): SecondaryEntry[] {
  return chunk([...bytes], SECONDARY_ENTRY_SIZE)
    .filter((entry) => entry.length === SECONDARY_ENTRY_SIZE)
    .map((entry, i) => ({
      heroId: i,
      classId: entry[0]!,
      level: entry[1]!,
      unknown: [entry[2]!, entry[3]!, entry[4]!, entry[5]!],
    }))
}

function decodeClasses(bytes: Uint8Array): ClassEntry[] {
  return chunk([...bytes], CLASS_ENTRY_SIZE).map((entry, classId) => ({
    classId,
    mov: entry[0]!,
    unitClass: entry[3]!,
    unknown04: entry[4]!,
  }))
}

export function decodeCharacterData(bytes: Uint8Array): CharacterTables {
  const segments = decodeSegments(bytes, 0x232c00, {
    secondary: 0x08,
    classes: 0x0c,
    records: 0x10,
  })

  return {
    records: decodeRecords(segments.records),
    secondary: decodeSecondary(segments.secondary),
    classes: decodeClasses(segments.classes),
  }
}
