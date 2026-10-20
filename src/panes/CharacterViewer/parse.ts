import { chunk, chunkBy } from 'es-toolkit'

const POINTER_SIZE = 4
const AUX = {
  CHAR_PTRS: 0x00,
  DUPLICATE: 0x04, // dupe
  SECONDARY: 0x08,
  CLASSES: 0x0c,
} as const
const AUX_POINTER_COUNT = 4
/** The sub-array of character pointers follows the aux entries: 4 × 4 = 0x10. */
const CHAR_PTR_START = AUX_POINTER_COUNT * POINTER_SIZE
const STATS_PER_RECORD = 5 // HP, MP, ATT, DEF, AGI
const RECORD_PAYLOAD = 1 + STATS_PER_RECORD * 2 // class id + (growth, value) pairs for stats

const SECONDARY_ENTRY_SIZE = 6
const CLASS_ENTRY_SIZE = 5

export type StatPair = { growth: number; value: number }

export type SpellLearn = { level: number; spell: number }

export type CharacterRecord = {
  classId: number
  stats: { hp: StatPair; mp: StatPair; att: StatPair; def: StatPair; agi: StatPair }
  /** Spell tail after the five stat pairs: [level, spell] until the terminator. */
  spells: SpellLearn[]
  /** FF for normal records; FE for the candidate level-cap stat records. */
  terminator: number
}

export type SecondaryEntry = {
  classId: number
  level: number
  unknown: [number, number, number, number]
}

export type ClassEntry = {
  classId: number
  mov: number
  unknown: [number, number, number, number]
}

export type CharacterTables = {
  records: CharacterRecord[]
  secondary: SecondaryEntry[]
  classes: ClassEntry[]
}

function readU32be(data: Uint8Array, offset: number): number | null {
  if (offset < 0 || offset + 4 > data.length) return null
  return (
    ((data[offset]! << 24) |
      (data[offset + 1]! << 16) |
      (data[offset + 2]! << 8) |
      data[offset + 3]!) >>>
    0
  )
}

function statPair(data: number[], at: number): StatPair {
  return { growth: data[at]!, value: data[at + 1]! }
}

function iterPair<T>(array: T[]): [T, T][] {
  return chunk(array, 2) as [T, T][]
}

function parseRecords(bytes: Uint8Array): CharacterRecord[] {
  const grouped = chunkBy([...bytes], (byte) => byte === 0xff || byte === 0xfe)
  return iterPair(grouped).map(([entry, separators]) => {
    return {
      classId: entry[0]!,
      stats: {
        hp: statPair(entry, 1),
        mp: statPair(entry, 3),
        att: statPair(entry, 5),
        def: statPair(entry, 7),
        agi: statPair(entry, 9),
      },
      spells: iterPair(entry.slice(RECORD_PAYLOAD)).map(([level, spell]) => ({
        level: level,
        spell: spell,
      })),
      terminator: separators![0]!,
    }
  })
}

function parseSecondary(bytes: Uint8Array): SecondaryEntry[] {
  return chunk([...bytes], SECONDARY_ENTRY_SIZE)
    .filter((entry) => entry.length === SECONDARY_ENTRY_SIZE)
    .map((entry) => ({
      classId: entry[0]!,
      level: entry[1]!,
      unknown: [entry[2]!, entry[3]!, entry[4]!, entry[5]!],
    }))
}

function parseClasses(bytes: Uint8Array): ClassEntry[] {
  return chunk([...bytes], CLASS_ENTRY_SIZE).map((entry, classId) => ({
    classId,
    mov: entry[0]!,
    unknown: [entry[1]!, entry[2]!, entry[3]!, entry[4]!],
  }))
}

export function parseCharacterData(bytes: Uint8Array): CharacterTables {
  const empty = { records: [], secondary: [], classes: [] }

  const headerA = readU32be(bytes, AUX.CHAR_PTRS)
  if (headerA === null) return empty
  // ROM encodes actual pointer so adjust for relative addressing here
  const baseOffset = headerA - CHAR_PTR_START

  // The first character pointer targets the first record, packed right after
  // the sub-array; its distance from the sub-array start is the array itself.
  const recordsStart = (readU32be(bytes, CHAR_PTR_START) ?? 0) - baseOffset
  if (recordsStart <= CHAR_PTR_START || recordsStart > bytes.length) return empty

  const secondaryStart = (readU32be(bytes, AUX.SECONDARY) ?? 0) - baseOffset
  const classStart = (readU32be(bytes, AUX.CLASSES) ?? 0) - baseOffset
  const secondaryInRange = secondaryStart >= recordsStart && secondaryStart < bytes.length
  const classInRange = classStart >= recordsStart && classStart < bytes.length

  return {
    records: parseRecords(bytes.slice(recordsStart, secondaryStart)),
    secondary: secondaryInRange ? parseSecondary(bytes.slice(secondaryStart, classStart)) : [],
    classes: classInRange ? parseClasses(bytes.slice(classStart)) : [],
  }
}
