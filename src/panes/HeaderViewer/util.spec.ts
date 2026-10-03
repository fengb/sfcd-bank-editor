import { describe, expect, it } from 'vitest'

import { DUMMY_SENTINEL, isDummyBank, readU32be } from './util'

describe('readU32be', () => {
  it('reads big-endian u32 values', () => {
    const data = new Uint8Array([0x00, 0x00, 0x12, 0x34, 0x7f, 0xff, 0xff, 0xff])
    expect(readU32be(data, 0)).toBe(0x1234)
    expect(readU32be(data, 4)).toBe(0x7fffffff)
  })

  it('stays unsigned when bit 31 is set', () => {
    // `<<`/`|` produce int32, so these must not come back negative.
    expect(readU32be(new Uint8Array([0x80, 0x00, 0x00, 0x00]), 0)).toBe(0x80000000)
    expect(readU32be(new Uint8Array([0xc1, 0x92, 0xa4, 0x00]), 0)).toBe(0xc192a400)
    expect(readU32be(new Uint8Array([0xff, 0xff, 0xff, 0xff]), 0)).toBe(0xffffffff)
  })

  it('returns null for out-of-bounds reads', () => {
    const data = new Uint8Array(8)
    expect(readU32be(data, 5)).toBeNull()
    expect(readU32be(data, -1)).toBeNull()
    expect(readU32be(data, 0)).toBe(0)
    expect(readU32be(data, 4)).toBe(0)
  })
})

describe('isDummyBank', () => {
  it('detects the DUMMY sentinel', () => {
    const bytes = [...DUMMY_SENTINEL].map((c) => c.charCodeAt(0))
    expect(isDummyBank(new Uint8Array(bytes))).toBe(true)
    expect(isDummyBank(new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00]))).toBe(false)
  })
})
