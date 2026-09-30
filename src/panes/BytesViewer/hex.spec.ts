import { describe, expect, it } from 'vitest'

import { formatAsciiCell, formatHex, formatHexCell, formatOffset, parseHexOffset } from './hex'

describe('formatOffset', () => {
  it('pads to the fixed offset width', () => {
    expect(formatOffset(0)).toBe('000000')
    expect(formatOffset(0x20)).toBe('000020')
    expect(formatOffset(0x6d000)).toBe('06D000')
  })
})

describe('formatHexCell', () => {
  it('renders the row at the given offset', () => {
    const data = new Uint8Array([0xde, 0xad, 0xbe, 0xef])
    expect(formatHexCell(data, 0)).toBe('DE AD BE EF')
  })

  it('reads from the offset, not the start', () => {
    const data = new Uint8Array([1, 2, 3, 4])
    expect(formatHexCell(data, 2)).toBe('03 04')
  })

  it('clamps a short final row to the end of the buffer', () => {
    expect(formatHexCell(new Uint8Array([1, 2, 3]), 0)).toBe('01 02 03')
  })

  it('is empty past the end of the buffer', () => {
    expect(formatHexCell(new Uint8Array([1, 2, 3]), 99)).toBe('')
  })
})

describe('formatAsciiCell', () => {
  it('renders printable ASCII alongside', () => {
    const data = new Uint8Array([0x48, 0x65, 0x78, 0x00, 0x41])
    expect(formatAsciiCell(data, 0)).toBe('Hex.A')
  })

  it('replaces non printable bytes with a dot', () => {
    expect(formatAsciiCell(new Uint8Array([0x00, 0x1f, 0x7f, 0xff]), 0)).toBe('....')
  })

  it('clamps a short final row to the end of the buffer', () => {
    expect(formatAsciiCell(new Uint8Array([0x41, 0x42, 0x43]), 0)).toBe('ABC')
  })
})

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
