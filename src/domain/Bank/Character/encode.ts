import type { CharacterTables } from './decode'

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

const TOTAL_CHARACTER_COUNT = 20

/** Offset where record data begins: after all 20 pointers (0x10 + 20×4 = 0x60). */
const RECORDS_START = CHAR_PTR_START + TOTAL_CHARACTER_COUNT * POINTER_SIZE

export function encodeCharacterData(tables: CharacterTables, baseOffset: number = 0): Uint8Array {
  const { records, secondary, classes } = tables

  const recordChunks = records.map((record) => [
    record.classId,
    record.stats.hp.growth,
    record.stats.hp.value,
    record.stats.mp.growth,
    record.stats.mp.value,
    record.stats.att.growth,
    record.stats.att.value,
    record.stats.def.growth,
    record.stats.def.value,
    record.stats.agi.growth,
    record.stats.agi.value,
    ...record.spells.flatMap((spell) => [spell.level, spell.spell]),
    record.terminator,
  ])

  // 2 bytes padding (0xFF) between records and secondary, matching the original format.
  const secondaryStart = RECORDS_START + recordChunks.flat().length + 2

  const secondaryChunks = secondary.map((entry) => [
    entry.classId,
    entry.level,
    entry.unknown[0]!,
    entry.unknown[1]!,
    entry.unknown[2]!,
    entry.unknown[3]!,
  ])

  // 2 bytes padding (0xFF) between secondary and classes, matching original format.
  const classStart = secondaryStart + secondaryChunks.flat().length + 2

  const classesBytes = classes.flatMap((entry) => [
    entry.mov,
    entry.unknown[0]!,
    entry.unknown[1]!,
    entry.unknown[2]!,
    entry.unknown[3]!,
  ])

  const total = classStart + classesBytes.length
  // Fill with 0xFF (erased ROM state); gaps between sections stay 0xFF automatically.
  const out = new Uint8Array(total).fill(0xff)
  const view = new DataView(out.buffer)

  // AUX pointers
  const charPtrsValue = baseOffset + CHAR_PTR_START
  view.setUint32(AUX.CHAR_PTRS, charPtrsValue)
  view.setUint32(AUX.DUPLICATE, charPtrsValue) // DUPLICATE mirrors CHAR_PTRS
  view.setUint32(AUX.SECONDARY, baseOffset + secondaryStart)
  view.setUint32(AUX.CLASSES, baseOffset + classStart)

  // Precompute cumulative record offsets for pointer targets.
  const recordOffsets: number[] = []
  let cursor = 0
  for (const chunk of recordChunks) {
    recordOffsets.push(cursor)
    cursor += chunk.length
  }

  // Write 20 pointers: pointer[i] targets record (2*i).
  for (let i = 0; i < TOTAL_CHARACTER_COUNT; i++) {
    const recordIndex = i * 2
    const ptr =
      recordIndex < recordOffsets.length
        ? baseOffset + RECORDS_START + recordOffsets[recordIndex]!
        : 0
    view.setUint32(CHAR_PTR_START + i * POINTER_SIZE, ptr)
  }

  // Data sections
  out.set(recordChunks.flat(), RECORDS_START)
  out.set(secondaryChunks.flat(), secondaryStart)
  out.set(classesBytes, classStart)

  return out
}
