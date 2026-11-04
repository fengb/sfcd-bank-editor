import { describe, expect, it } from 'vitest'

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { decodeCharacterData } from './decode'
import { encodeCharacterData } from './encode'

const BASE_OFFSET = 0x232c00

function u32be(value: number): number[] {
  return [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff]
}

const NICK = [
  0x00, 0x07, 0x0c, 0x01, 0x08, 0x03, 0x07, 0x03, 0x06, 0x02, 0x04, 0x01, 0x0a, 0x10, 0x0d, 0x14,
  0x4d, 0x19, 0x8d, 0x1e, 0xcd, 0xff,
]

const PROMOTED = [0x01, 0x04, 0x5a, 0x01, 0x32, 0x03, 0x3c, 0x06, 0x41, 0x02, 0x1e, 0xfe]

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
  bytes.set(u32be(BASE_OFFSET + 0x10), 0x00)
  bytes.set(u32be(BASE_OFFSET + 0x10), 0x04)
  bytes.set(u32be(BASE_OFFSET + secondaryStart), 0x08)
  bytes.set(u32be(BASE_OFFSET + classStart), 0x0c)
  bytes.set(u32be(BASE_OFFSET + NICK_OFFSET), 0x10)
  bytes.set(u32be(BASE_OFFSET + RUCE_OFFSET), 0x14)

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

describe('decodeCharacterData => encodeCharacterData', () => {
  it('round-trips the extracted region', async () => {
    const bytes = new Uint8Array(await readFile(resolve(import.meta.dirname, 'region.test.bin')))
    const tables = decodeCharacterData(bytes)
    const encoded = encodeCharacterData(tables, BASE_OFFSET)
    expect(encoded).toEqual(bytes)
  })

  it('is idempotent at the byte level (encode => decode => encode)', async () => {
    const bytes = new Uint8Array(await readFile(resolve(import.meta.dirname, 'region.test.bin')))
    const tables = decodeCharacterData(bytes)
    const encodedOnce = encodeCharacterData(tables, BASE_OFFSET)
    const roundTripped = decodeCharacterData(encodedOnce)
    const encodedTwice = encodeCharacterData(roundTripped, BASE_OFFSET)
    expect(Array.from(encodedTwice)).toEqual(Array.from(encodedOnce))
  })
})

describe('encodeCharacterData => decodeCharacterData', () => {
  it('round-trips empty tables', () => {
    const encoded = encodeCharacterData({ records: [], secondary: [], classes: [] })
    expect(decodeCharacterData(encoded)).toEqual({
      records: [],
      secondary: [],
      classes: [],
    })
  })
})

describe('encodeCharacterData', () => {
  const tables = decodeCharacterData(buildSegment())

  it('encodes decoded tables to a segment of the expected size', () => {
    const encoded = encodeCharacterData(tables, BASE_OFFSET)
    expect(encoded).toBeInstanceOf(Uint8Array)
    expect(encoded.length).toBe(291)
  })

  it('encodes with baseOffset 0', () => {
    const encoded = encodeCharacterData(tables)
    expect(encoded).toBeInstanceOf(Uint8Array)
    expect(encoded.length).toBe(291)
  })

  it('encodes records with spells', () => {
    const nick = tables.records[0]!
    expect(nick.spells).toHaveLength(5)
    const encoded = encodeCharacterData(
      { records: [nick], secondary: [], classes: [] },
      BASE_OFFSET,
    )
    expect(encoded).toBeInstanceOf(Uint8Array)
    expect(encoded.length).toBe(122)
  })

  it('preserves the FE terminator byte for promoted records', () => {
    const promoted = tables.records[1]!
    expect(promoted.terminator).toBe(0xfe)
    const encoded = encodeCharacterData({ records: [promoted], secondary: [], classes: [] })
    expect(encoded).toBeInstanceOf(Uint8Array)
    expect(encoded.length).toBe(112)
    expect(Array.from(encoded)).toContain(0xfe)
  })
})
