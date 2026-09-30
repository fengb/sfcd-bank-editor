import { describe, expect, it } from 'vitest'

import { byteAt, buildHexRows, formatHex } from './hex'

describe('formatHex', () => {
  it('pads to the requested width', () => {
    expect(formatHex(0)).toBe('00')
    expect(formatHex(0x0a)).toBe('0A')
    expect(formatHex(0x10, 4)).toBe('0010')
  })
})

describe('byteAt', () => {
  it('returns 0 past the end instead of undefined', () => {
    const data = new Uint8Array([1, 2])
    expect(byteAt(data, 1)).toBe(2)
    expect(byteAt(data, 99)).toBe(0)
    expect(byteAt(data, -1)).toBe(0)
  })
})

describe('buildHexRows', () => {
  it('renders a single row with ascii alongside', () => {
    const data = new Uint8Array([0x48, 0x65, 0x78, 0x00, 0x41])
    const rows = buildHexRows(data, 0, data.length)

    expect(rows).toHaveLength(1)
    expect(rows[0]?.offset).toBe(0)
    expect(rows[0]?.hex).toBe('48 65 78 00 41')
    expect(rows[0]?.ascii).toBe('Hex.A')
  })

  it('replaces non printable bytes with a dot', () => {
    const rows = buildHexRows(new Uint8Array([0x00, 0x7f, 0xff]), 0, 3)
    expect(rows[0]?.ascii).toBe('...')
  })

  it('clamps to the end of the buffer', () => {
    const rows = buildHexRows(new Uint8Array([1, 2, 3]), 0, 100)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.bytes).toHaveLength(3)
  })

  it('returns nothing for an empty range', () => {
    expect(buildHexRows(new Uint8Array(), 0, 16)).toEqual([])
  })
})
