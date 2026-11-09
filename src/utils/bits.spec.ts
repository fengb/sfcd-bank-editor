import { describe, expect, it } from 'vitest'

import { splitBits } from './bits'

describe('splitBits', () => {
  it('splits MSB-first by widths', () => {
    // 0b101_010 -> high 3 bits = 5, low 3 bits = 2
    expect(splitBits(0b101_010, [3, 3])).toEqual([5, 2])
  })

  it('splits a 16-bit value into bytes (high first)', () => {
    expect(splitBits(0x1234, [8, 8])).toEqual([0x12, 0x34])
  })

  it('splits a nibble pair (high first)', () => {
    expect(splitBits(0xab, [4, 4])).toEqual([0xa, 0xb])
  })

  it('supports arbitrary number of fields', () => {
    // 12 bits: 4,4,4
    expect(splitBits(0xabc, [4, 4, 4])).toEqual([0xa, 0xb, 0xc])
  })

  it('matches the repeatCommand split from decodeBasicGraphics', () => {
    // low 5 bits = repeat code, high 11 bits = word index
    const repeatCommand = (7 << 5) | 13 // wordIndex=7, repeatCode=13
    const [wordIndex, repeatCode] = splitBits(repeatCommand, [11, 5])
    expect(wordIndex).toBe(7)
    expect(repeatCode).toBe(13)
  })

  it('matches the spell idx/flags split', () => {
    const value = (2 << 6) | 0x1f // flags=2, idx=0x1f
    const [flags, idx] = splitBits(value, [2, 6])
    expect(flags).toBe(2)
    expect(idx).toBe(0x1f)
  })
})
