import { describe, expect, it } from 'vitest'

import { encodeDialogPage, encodeTokens } from './encode'

describe('encodeTokens', () => {
  it('throws when the 0xfe tree is missing', () => {
    expect(() => encodeTokens({}, [12])).toThrow('missing tree for 0xfe')
  })

  it('throws when the tree for the last token is missing', () => {
    const trees = {
      0xfe: { freq: 1, left: { token: 0xfe, freq: 1 }, right: { token: 12, freq: 1 } },
    }
    expect(() => encodeTokens(trees, [12])).toThrow('missing tree for 0xc')
  })

  it('throws when a token is not encodable in the current tree', () => {
    const trees = {
      0xfe: { freq: 1, left: { token: 0xfe, freq: 1 }, right: { token: 12, freq: 1 } },
    }
    expect(() => encodeTokens(trees, [13])).toThrow('not encodable')
  })

  it('encodes a single token stream', () => {
    const trees = {
      0xfe: { freq: 1, left: { token: 0xfe, freq: 1 }, right: { token: 12, freq: 1 } },
      12: { freq: 1, left: { token: 0xfe, freq: 1 }, right: { token: 12, freq: 1 } },
    }
    const encoded = encodeTokens(trees, [12])
    expect(Array.from(encoded)).toEqual([0x80])
  })
})

describe('encodeDialogPage', () => {
  it('encodes a dialog page', () => {
    const trees = {
      0xfe: { freq: 1, left: { token: 0xfe, freq: 1 }, right: { token: 12, freq: 1 } },
      12: { freq: 1, left: { token: 0xfe, freq: 1 }, right: { token: 12, freq: 1 } },
    }
    const encoded = encodeDialogPage(trees, [[12]])
    expect(Array.from(encoded)).toEqual([1, 0x80, 0])
  })

  it('throws when an encoded string is too long for a page', () => {
    const trees = {
      0xfe: { freq: 1, left: { token: 0xfe, freq: 1 }, right: { token: 12, freq: 1 } },
      12: { freq: 1, left: { token: 0xfe, freq: 1 }, right: { token: 12, freq: 1 } },
    }
    const longTokens = Array.from({ length: 3000 }, () => 12)
    expect(() => encodeDialogPage(trees, [longTokens])).toThrow('encoded string too long for page')
  })
})
