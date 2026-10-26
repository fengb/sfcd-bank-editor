import { describe, expect, it } from 'vitest'

import { decodeCharacterData } from './decode'

const ROM_BASE = 0x232c00

function u32be(value: number): number[] {
  return [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff]
}

// NICK's documented record: class SDMN, magic user with a spell tail.
const NICK = [
  0x00, 0x07, 0x0c, 0x01, 0x08, 0x03, 0x07, 0x03, 0x06, 0x02, 0x04, 0x01, 0x0a, 0x10, 0x0d, 0x14,
  0x4d, 0x19, 0x8d, 0x1e, 0xcd, 0xff,
]

// Unpointed promoted record with an FE terminator (max-stats candidate).
const PROMOTED = [0x01, 0x04, 0x5a, 0x01, 0x32, 0x03, 0x3c, 0x06, 0x41, 0x02, 0x1e, 0xfe]

// RUCE's documented record: class WARR, no MP, no spell tail.
const RUCE = [0x04, 0x03, 0x09, 0x00, 0x00, 0x03, 0x08, 0x07, 0x08, 0x01, 0x04, 0xff]

const NICK_OFFSET = 0x60
const PROMOTED_OFFSET = NICK_OFFSET + NICK.length // 0x076
const RUCE_OFFSET = PROMOTED_OFFSET + PROMOTED.length // 0x082

/** Build a minimal but structurally faithful segment around the three records. */
function buildSegment(): Uint8Array {
  const secondaryStart = RUCE_OFFSET + RUCE.length + 2 // skip the FF FF marker
  const classStart = secondaryStart + 20 * 6
  const length = classStart + 5 * 5

  const bytes = new Uint8Array(length)

  // Header: [A]/[B], [C] secondary table, [D] class table, then [0]/[1].
  bytes.set(u32be(ROM_BASE + 0x10), 0x00)
  bytes.set(u32be(ROM_BASE + 0x10), 0x04)
  bytes.set(u32be(ROM_BASE + secondaryStart), 0x08)
  bytes.set(u32be(ROM_BASE + classStart), 0x0c)
  bytes.set(u32be(ROM_BASE + NICK_OFFSET), 0x10)
  bytes.set(u32be(ROM_BASE + RUCE_OFFSET), 0x14)

  bytes.set(NICK, NICK_OFFSET)
  bytes.set(PROMOTED, PROMOTED_OFFSET)
  bytes.set(RUCE, RUCE_OFFSET)
  bytes.set([0xff, 0xff], RUCE_OFFSET + RUCE.length)

  // Secondary table: NICK and RUCE, both starting at level 1. The remaining
  // entries are the 7F padding seen in the real file.
  bytes.fill(0x7f, secondaryStart + 12, secondaryStart + 20 * 6)
  bytes.set([0x00, 0x01, 0xa0, 0x8b, 0x00, 0x00], secondaryStart)
  bytes.set([0x04, 0x01, 0xb2, 0x8b, 0x00, 0x00], secondaryStart + 6)

  // Class table: SDMN, HERO, KNTE, PALA, WARR (entry index = class id).
  bytes.set(
    [
      0x06, 0x00, 0x00, 0x10, 0x03, 0x06, 0x00, 0x00, 0x10, 0x93, 0x07, 0x00, 0x00, 0x20, 0x03,
      0x07, 0x00, 0x00, 0x20, 0x43, 0x05, 0x00, 0x00, 0x10, 0x03,
    ],
    classStart,
  )

  return bytes
}

describe('decodeCharacterData', () => {
  const { records, secondary, classes } = decodeCharacterData(buildSegment())

  it('decodes pointered, unpointed, and spell-tailed records in order', () => {
    expect(records).toHaveLength(3)

    expect(records[0]).toEqual({
      classId: 0x00,
      stats: {
        hp: { growth: 0x07, value: 0x0c },
        mp: { growth: 0x01, value: 0x08 },
        att: { growth: 0x03, value: 0x07 },
        def: { growth: 0x03, value: 0x06 },
        agi: { growth: 0x02, value: 0x04 },
      },
      spells: [
        { level: 1, spell: 0x0a },
        { level: 16, spell: 0x0d },
        { level: 20, spell: 0x4d },
        { level: 25, spell: 0x8d },
        { level: 30, spell: 0xcd },
      ],
      terminator: 0xff,
    })

    expect(records[1]?.classId).toBe(0x01)
    expect(records[1]?.terminator).toBe(0xfe)
    expect(records[1]?.spells).toEqual([])
  })

  it('matches RUCE byte-for-byte on the five known stats', () => {
    const ruce = records[2]
    expect(ruce?.classId).toBe(0x04)
    expect(ruce?.stats).toEqual({
      hp: { growth: 0x03, value: 9 },
      mp: { growth: 0x00, value: 0 },
      att: { growth: 0x03, value: 8 },
      def: { growth: 0x07, value: 8 },
      agi: { growth: 0x01, value: 4 },
    })
    expect(ruce?.spells).toEqual([])
    expect(ruce?.terminator).toBe(0xff)
  })

  it('parses the level from byte 1 of each secondary entry', () => {
    expect(secondary).toHaveLength(20)
    expect(secondary[0]).toEqual({
      classId: 0x00,
      level: 1,
      unknown: [0xa0, 0x8b, 0x00, 0x00],
    })
    expect(secondary[1]?.classId).toBe(0x04)
    expect(secondary[1]?.level).toBe(1)
    expect(secondary[19]?.unknown).toEqual([0x7f, 0x7f, 0x7f, 0x7f])
  })

  it('indexes the class table by class id with MOV in byte 0', () => {
    expect(classes).toHaveLength(5)
    expect(classes[0]).toEqual({
      classId: 0x00,
      mov: 6,
      unknown: [0x00, 0x00, 0x10, 0x03],
    })
    expect(classes[4]?.mov).toBe(5)
    expect(classes[4]?.unknown).toEqual([0x00, 0x00, 0x10, 0x03])
  })

  it('returns empty tables for buffers too short to hold a header', () => {
    expect(decodeCharacterData(new Uint8Array(0))).toEqual({
      records: [],
      secondary: [],
      classes: [],
    })
    expect(decodeCharacterData(new Uint8Array(0x5f))).toEqual({
      records: [],
      secondary: [],
      classes: [],
    })
  })
})
