import { describe, it, expect } from 'vitest'

import { decodeStackGraphics, decodeBasicGraphics } from './graphics'

describe('decodeStackGraphics', () => {
  it('returns [] for an empty input', () => {
    expect(decodeStackGraphics(new Uint8Array([]))).toEqual([])
  })

  it('terminates on a sentinel copyOffset of 0', () => {
    // command pattern 1110 -> [1,0,0,0]; copyOffset 11 bits of 0 => sentinel
    expect(decodeStackGraphics(new Uint8Array([0xe0, 0x00]))).toEqual([])
  })

  it('does not hang when a copy zero-run reaches EOF', () => {
    // command pattern 100 -> [0,0,0,1]; offset=1 followed by EOF zeros
    const result = decodeStackGraphics(new Uint8Array([0x80, 0x04]))
    expect(result).not.toBeNull()
  })

  it('does not hang on an all-zero input', () => {
    const result = decodeStackGraphics(new Uint8Array(64))
    expect(result).not.toBeNull()
  })
})

describe('decodeBasicGraphics', () => {
  it('returns [] for an empty input', () => {
    expect(decodeBasicGraphics(new Uint8Array([]))).toEqual([])
  })

  it('terminates on a sentinel repeatCommand of 0', () => {
    // 16-bit command word with a single set bit followed by 0x0000
    expect(decodeBasicGraphics(new Uint8Array([0x80, 0x00, 0x00, 0x00]))).toEqual([])
  })
})
