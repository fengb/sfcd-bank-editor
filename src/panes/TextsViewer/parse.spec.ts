import { describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import {
  bitsOf,
  splitTree,
  parseTokens,
  parseString,
  parseTextBlockPage,
  parseTextBlockPages,
  parseTextBlock,
  CHAR_TO_TOKEN,
  TOKEN_TO_CHAR,
  OFFSET,
} from './parse'

const path = join(import.meta.dirname, 'parse.test.bin')

describe('parseTextBlock', () => {
  it('returns an empty list for empty input', () => {
    expect(parseTextBlock(new Uint8Array())).toEqual([])
  })

  it('decodes the BANKD0E text block into 528 strings', async () => {
    const bytes = new Uint8Array(await readFile(path))
    const strings = parseTextBlock(bytes)

    expect(strings).toHaveLength(528)
    expect(strings[0]).toBe('The game will be suspended.↵OK?')
    expect(strings[strings.length - 1]).toBe(
      "They didn't know danger↵lay in wait for them↵...just beyond the horizon.⏹",
    )
    expect(strings.every((s) => typeof s === 'string' && s.length > 0)).toBe(true)
  })
})

describe('bitsOf', () => {
  it('yields bits MSB-first', () => {
    const gen = bitsOf(new Uint8Array([0b10110000]))
    const bits = Array.from({ length: 8 }, () => gen.next().value)
    expect(bits).toEqual([1, 0, 1, 1, 0, 0, 0, 0])
  })

  it('respects baseOffset', () => {
    const gen = bitsOf(new Uint8Array([0, 0b11001100]), 1)
    const bits = Array.from({ length: 4 }, () => gen.next().value)
    expect(bits).toEqual([1, 1, 0, 0])
  })

  it('counts', () => {
    const bytes = new Uint8Array(3600)
    let n = 0
    try {
      for (const bit of bitsOf(bytes, 1)) {
        n++
        void bit
      }
    } catch {
      // expected exhaustion throw after all bits
    }
    expect(n).toBe(3599 * 8)
  })
})

describe('splitTree', () => {
  it('splits a two-leaf tree', () => {
    const data = new Uint8Array([0x10, 0x20, 0b01100000])
    expect(splitTree(data, 2)).toEqual({
      tokens: [0x10, 0x20],
      tree: [0b01100000],
    })
  })
  it('splits a single-leaf tree', () => {
    const data = new Uint8Array([0x42, 0x80])
    expect(splitTree(data, 1)).toEqual({ tokens: [0x42], tree: [0x80] })
  })
})

describe('parseTokens', () => {
  it('decodes a token using the skip path', () => {
    const trees = {
      0xfe: { tokens: [12, 0xfe], tree: [0b01100000] },
    }
    const tokens = parseTokens(trees, new Uint8Array([0x80]), 0)
    expect(tokens).toEqual([12])
  })
})

describe('parseString', () => {
  it('maps a decoded symbol through TOKEN_TO_CHAR', () => {
    const trees = {
      0xfe: { tokens: [12, 0xfe], tree: [0b01100000] },
    }
    expect(parseString(trees, new Uint8Array([0x80]), 0)).toBe('A')
  })
})
describe('parseString intermediate specials', () => {
  it('maps a special symbol to its intermediate glyph', () => {
    const trees = {
      0xfe: { tokens: [0xef, 0xfe], tree: [0b01100000] },
    }
    expect(parseString(trees, new Uint8Array([0x80]), 0)).toBe('↵')
  })
})

describe('CHAR_TO_TOKEN', () => {
  it('every table entry is invertible', () => {
    for (const [symbol, char] of Object.entries(TOKEN_TO_CHAR)) {
      expect([...char]).toHaveLength(1)
      expect(char.charCodeAt(0)).toBeLessThanOrEqual(0xffff)
      expect(CHAR_TO_TOKEN.get(char)).toBe(Number(symbol))
    }
  })
})

describe('parseTextBlockPage', () => {
  it('decodes a single line', () => {
    const trees = {
      0xfe: { tokens: [12, 0xfe], tree: [0b01100000] },
    }
    const data = new Uint8Array([1, 0x80])
    expect(parseTextBlockPage(trees, data)).toEqual(['A'])
  })

  it('returns [] for empty input', () => {
    const trees = { 0xfe: { tokens: [0xfe], tree: [0x80] } }
    expect(parseTextBlockPage(trees, new Uint8Array())).toEqual([])
  })
})

describe('parseTextBlockPages', () => {
  it('returns [] for empty input', () => {
    const trees = { 0xfe: { tokens: [0xfe], tree: [0x80] } }
    expect(parseTextBlockPages(trees, new Uint8Array(), 0)).toEqual([])
  })

  it('decodes a bank reached through an offset table', () => {
    const trees = {
      0xfe: { tokens: [12, 0xfe], tree: [0b01100000] },
    }
    const bytes = new Uint8Array(20)
    new DataView(bytes.buffer).setUint32(0, OFFSET + 10, false)
    bytes[10] = 1
    bytes[11] = 0x80
    expect(parseTextBlockPages(trees, bytes, 0)).toEqual(['A'])
  })
})
