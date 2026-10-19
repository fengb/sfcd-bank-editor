const POINTER_SIZE = 4
/**
 * Aux pointer indices in the leading block. [A]/[B] point at the character
 * pointer sub-array that immediately follows them, [C] at the starting-level
 * table, [D] at the class data table.
 */
const AUX = {
  /** Points at the character pointer sub-array; pins the ROM base. */
  CHAR_PTRS: 0,
  /** Documented duplicate of [A]; not consulted. */
  DUPLICATE: 1,
  /** Starting-level table. */
  SECONDARY: 2,
  /** Class data table. */
  CLASSES: 3,
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

function statPair(data: Uint8Array, at: number): StatPair {
  return { growth: data[at]!, value: data[at + 1]! }
}

function parseRecords(bytes: Uint8Array): CharacterRecord[] {
  const records: CharacterRecord[] = []
  let offset = 0

  while (offset + RECORD_PAYLOAD <= bytes.length) {
    const classId = bytes[offset]!
    // The table ends in an FF FF marker; no record starts with FF or FE.
    if (classId === 0xff || classId === 0xfe) break

    // Magic users carry a [level, spell] tail between the stat pairs and the terminator.
    const spells: SpellLearn[] = []
    let i = offset + RECORD_PAYLOAD
    while (i + 1 < bytes.length && bytes[i] !== 0xff && bytes[i] !== 0xfe) {
      spells.push({ level: bytes[i]!, spell: bytes[i + 1]! })
      i += 2
    }

    records.push({
      classId,
      stats: {
        hp: statPair(bytes, offset + 1),
        mp: statPair(bytes, offset + 3),
        att: statPair(bytes, offset + 5),
        def: statPair(bytes, offset + 7),
        agi: statPair(bytes, offset + 9),
      },
      spells,
      terminator: bytes[i] ?? 0xff,
    })
    offset = i + 1
  }

  return records
}

function parseSecondary(bytes: Uint8Array): SecondaryEntry[] {
  const count = Math.floor(bytes.length / SECONDARY_ENTRY_SIZE)
  const entries: SecondaryEntry[] = []
  for (let index = 0; index < count; index++) {
    const offset = index * SECONDARY_ENTRY_SIZE
    entries.push({
      classId: bytes[offset]!,
      level: bytes[offset + 1]!,
      unknown: [bytes[offset + 2]!, bytes[offset + 3]!, bytes[offset + 4]!, bytes[offset + 5]!],
    })
  }
  return entries
}

function parseClasses(bytes: Uint8Array): ClassEntry[] {
  const entries: ClassEntry[] = []
  for (let classId = 0; (classId + 1) * CLASS_ENTRY_SIZE <= bytes.length; classId++) {
    const offset = classId * CLASS_ENTRY_SIZE
    entries.push({
      classId,
      mov: bytes[offset]!,
      unknown: [bytes[offset + 1]!, bytes[offset + 2]!, bytes[offset + 3]!, bytes[offset + 4]!],
    })
  }
  return entries
}

export function parseCharacterData(bytes: Uint8Array): CharacterTables {
  const empty = { records: [], secondary: [], classes: [] }

  // [A] (file offset 0x00) points at the character pointer sub-array, so its
  // target pins both the sub-array start and the ROM base for everything else.
  const headerA = readU32be(bytes, 0x00)
  if (headerA === null) return empty
  const base = headerA - CHAR_PTR_START
  const fileOffsetOf = (pointer: number): number => pointer - base

  // The first character pointer targets the first record, packed right after
  // the sub-array; its distance from the sub-array start is the array itself.
  const recordsStart = fileOffsetOf(readU32be(bytes, CHAR_PTR_START) ?? 0)
  if (recordsStart <= CHAR_PTR_START || recordsStart > bytes.length) return empty

  const secondaryStart = fileOffsetOf(readU32be(bytes, 0x08) ?? 0)
  const classStart = fileOffsetOf(readU32be(bytes, 0x0c) ?? 0)
  const secondaryInRange = secondaryStart >= recordsStart && secondaryStart < bytes.length
  const classInRange = classStart >= recordsStart && classStart < bytes.length

  return {
    // Records end at the FF FF marker before the secondary table; bound the
    // walk so a malformed pointer cannot spill into the tables beyond.
    records: parseRecords(bytes.slice(recordsStart, secondaryStart)),
    secondary: secondaryInRange ? parseSecondary(bytes.slice(secondaryStart, classStart)) : [],
    classes: classInRange ? parseClasses(bytes.slice(classStart)) : [],
  }
}
