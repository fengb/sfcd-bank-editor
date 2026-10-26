import { describe, expect, it } from 'vitest'

import { readU16be, readU32be } from './util'

describe('readU32be', () => {
  it('reads a big-endian 32-bit value', () => {
    const data = new Uint8Array([0x12, 0x34, 0x56, 0x78])
    expect(readU32be(data, 0)).toBe(0x12345678)
  })

  it('honours the offset', () => {
    const data = new Uint8Array([0x00, 0x00, 0x12, 0x34, 0x56, 0x78])
    expect(readU32be(data, 2)).toBe(0x12345678)
  })

  it('returns null when the read would run past the end', () => {
    expect(readU32be(new Uint8Array(3), 0)).toBeNull()
    expect(readU32be(new Uint8Array(4), 1)).toBeNull()
  })

  it('returns null for a negative offset', () => {
    expect(readU32be(new Uint8Array(4), -1)).toBeNull()
  })
})

describe('readU16be', () => {
  it('reads a big-endian 16-bit value', () => {
    const data = new Uint8Array([0x12, 0x34])
    expect(readU16be(data, 0)).toBe(0x1234)
  })

  it('honours the offset', () => {
    const data = new Uint8Array([0x00, 0x12, 0x34])
    expect(readU16be(data, 1)).toBe(0x1234)
  })
})
