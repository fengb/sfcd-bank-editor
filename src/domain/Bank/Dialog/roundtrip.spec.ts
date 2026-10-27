import { describe, expect, it } from 'vitest'

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { decodeDialog, decodeDialogPage, decodeString, decodeTokens } from './decode'
import { encodeDialog, encodeDialogPage, encodeTokens, stringToTokens } from './encode'

describe('encodeDialog => decodeDialog', () => {
  it('round-trips the full dialog with original bytes', async () => {
    const bytes = new Uint8Array(await readFile(resolve(import.meta.dirname, 'decode.test.bin')))
    const strings = decodeDialog(bytes)
    const encoded = encodeDialog(strings)
    expect(decodeDialog(encoded)).toEqual(strings)
  })

  it('round-trips an empty dialog', () => {
    const encoded = encodeDialog([])
    expect(decodeDialog(encoded)).toEqual([])
  })

  it('round-trips a dialog with two prefixed strings', () => {
    const strings = ['Ⓝ1fⓃ2a']
    const encoded = encodeDialog(strings)
    expect(decodeDialog(encoded)).toEqual(strings)
  })
})

describe('encodeTokens => decodeTokens', () => {
  it('round-trips a token stream', () => {
    const huffmanTrees = {
      0xfe: { tokens: [12, 0xfe], tree: [0b01100000] },
      12: { tokens: [12, 0xfe], tree: [0b01100000] },
    }
    const trees = {
      0xfe: { freq: 1, left: { token: 0xfe, freq: 1 }, right: { token: 12, freq: 1 } },
      12: { freq: 1, left: { token: 0xfe, freq: 1 }, right: { token: 12, freq: 1 } },
    }
    const encoded = encodeTokens(trees, [12])
    expect(decodeTokens(huffmanTrees, encoded, 0)).toEqual([12])
  })
})

describe('stringToTokens => encodeTokens => decodeString', () => {
  it('round-trips a string', () => {
    const huffmanTrees = {
      0xfe: { tokens: [12, 0xfe], tree: [0b01100000] },
      12: { tokens: [12, 0xfe], tree: [0b01100000] },
    }
    const trees = {
      0xfe: { freq: 1, left: { token: 0xfe, freq: 1 }, right: { token: 12, freq: 1 } },
      12: { freq: 1, left: { token: 0xfe, freq: 1 }, right: { token: 12, freq: 1 } },
    }
    const encoded = encodeTokens(trees, stringToTokens('A'))
    expect(decodeString(huffmanTrees, encoded, 0)).toBe('A')
  })

  it('round-trips a prefixed string', () => {
    const huffmanTrees = {
      0xfe: { tokens: [0xfc, 0xfe], tree: [0b01100000] },
      0xfc: { tokens: [1, 0xfc], tree: [0b01100000] },
      1: { tokens: [1, 0xfe], tree: [0b01100000] },
    }
    const trees = {
      0xfe: { freq: 1, left: { token: 0xfe, freq: 1 }, right: { token: 0xfc, freq: 1 } },
      0xfc: { freq: 1, left: { token: 0xfc, freq: 1 }, right: { token: 1, freq: 1 } },
      1: { freq: 1, left: { token: 0xfe, freq: 1 }, right: { token: 1, freq: 1 } },
    }
    const encoded = encodeTokens(trees, stringToTokens('Ⓝ1'))
    expect(decodeString(huffmanTrees, encoded, 0)).toBe('Ⓝ1')
  })
})

describe('encodeDialogPage => decodeDialogPage', () => {
  it('round-trips a dialog page', () => {
    const huffmanTrees = {
      0xfe: { tokens: [12, 0xfe], tree: [0b01100000] },
      12: { tokens: [12, 0xfe], tree: [0b01100000] },
    }
    const trees = {
      0xfe: { freq: 1, left: { token: 0xfe, freq: 1 }, right: { token: 12, freq: 1 } },
      12: { freq: 1, left: { token: 0xfe, freq: 1 }, right: { token: 12, freq: 1 } },
    }
    const encoded = encodeDialogPage(trees, [[12]])
    expect(decodeDialogPage(huffmanTrees, encoded)).toEqual(['A'])
  })
})
