import { describe, expect, it } from 'vitest'

import { formatHex, parseHexOffset } from './hex'

describe('parseHexOffset', () => {
  it('parses bare hex digits', () => {
    expect(parseHexOffset('1000', 0xffff)).toBe(0x1000)
    expect(parseHexOffset('0', 0xffff)).toBe(0)
    expect(parseHexOffset('ff', 0xffff)).toBe(0xff)
  })

  it('accepts an optional 0x prefix and surrounding space', () => {
    expect(parseHexOffset('0x1000', 0xffff)).toBe(0x1000)
    expect(parseHexOffset('0X1000', 0xffff)).toBe(0x1000)
    expect(parseHexOffset('  1000  ', 0xffff)).toBe(0x1000)
  })

  it('rejects input that is not hex', () => {
    expect(parseHexOffset('', 0xffff)).toBeNull()
    expect(parseHexOffset('   ', 0xffff)).toBeNull()
    expect(parseHexOffset('0x', 0xffff)).toBeNull()
    expect(parseHexOffset('nonsense', 0xffff)).toBeNull()
    expect(parseHexOffset('12g4', 0xffff)).toBeNull()
    expect(parseHexOffset('0x1 2', 0xffff)).toBeNull()
  })

  it('clamps to the bounds of the buffer', () => {
    expect(parseHexOffset('ffff', 0x1000)).toBe(0x1000)
    expect(parseHexOffset('0000', 0x1000)).toBe(0)
  })
})

describe('formatHex', () => {
  it('pads to the requested width', () => {
    expect(formatHex(0)).toBe('00')
    expect(formatHex(0x0a)).toBe('0A')
    expect(formatHex(0x10, 4)).toBe('0010')
  })
})
