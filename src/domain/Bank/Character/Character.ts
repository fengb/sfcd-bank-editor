import { decode } from './decode'

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

export default class Character {
  records: CharacterRecord[] = []
  secondary: SecondaryEntry[] = []
  classes: ClassEntry[] = []

  private constructor() {}

  static decode(bytes: Uint8Array): Character | null {
    const r = new Character()
    try {
      if (!decode(r, bytes)) return null
    } catch {
      return null
    }
    return r
  }
}

export type CharacterTables = Character
