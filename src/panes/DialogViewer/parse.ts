import { readU32be } from '@/domain/bank'

export const OFFSET = 0x22e000

const STRINGS_PER_PAGE = 256

function asLookup(startIndex: number, chars: string): Record<number, string> {
  return Object.fromEntries([...chars].map((char, i) => [startIndex + i, char]))
}

export const TOKEN_TO_CHAR: Record<number, string> = {
  1: ' ',
  ...asLookup(2, '0123456789'),
  ...asLookup(12, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
  ...asLookup(38, 'abcdefghijklmnopqrstuvwxyz'),
  64: '_',
  65: '-',
  66: '.',
  67: ',',
  68: '!',
  69: '?',
  70: '“',
  71: '”',
  72: "'",
  73: '(',
  74: ')',
  75: '#',
  76: '%',
  77: '&',
  78: '+',
  79: '/',
  80: ':',
  0xee: '§', // DICT
  0xef: '↵', // NEWLINE
  0xf0: '²', // DELAY medium
  0xf1: '♯', // NUMBER
  0xf2: '★', // NAME
  0xf3: '♔', // LEADER
  0xf4: '⚒', // ITEM
  0xf5: '✦', // SPELL
  0xf6: '♞', // CLASS
  0xf7: '⏸', // WAIT resume
  0xf8: '¹', // DELAY short
  0xf9: '³', // DELAY long
  0xfa: '⏹', // WAIT close
  0xfb: '⌫', // CLEAR
  0xfc: 'Ⓝ', // NAME prefix
  0xfd: 'ⓒ', // COLOR prefix
  0xfe: '¶', // EOL
}

export const CHAR_TO_TOKEN: Map<string, number> = new Map(
  Object.entries(TOKEN_TO_CHAR).map(([key, value]) => [value, Number(key)] as [string, number]),
)

export interface HuffmanTree {
  tokens: number[]
  tree: number[]
}
function decodeHuffmanTreeShape(treeBits: Generator<number>): {
  leafCount: number
  totalCount: number
} {
  let nonLeafCount = 0
  let leafCount = 0
  while (leafCount <= nonLeafCount) {
    const bit = treeBits.next().value
    if (bit === 0) nonLeafCount++
    else leafCount++
  }
  return { leafCount, totalCount: leafCount + nonLeafCount }
}

export function splitTree(data: Uint8Array, offset: number): HuffmanTree {
  const { leafCount, totalCount } = decodeHuffmanTreeShape(bitsOf(data, offset))
  const treeByteCount = (totalCount + 7) >> 3
  return {
    tokens: Array.from({ length: leafCount }).map((_, i) => data[offset - leafCount + i]!),
    tree: Array.from({ length: treeByteCount }).map((_, i) => data[offset + i]!),
  }
}

export function* bitsOf(bytes: ArrayLike<number>, baseOffset = 0): Generator<number> {
  const totalBits = (bytes.length - baseOffset) * 8
  for (let index = 0; index < totalBits; index++) {
    yield (bytes[baseOffset + (index >> 3)]! >> (7 - (index & 7))) & 1
  }
  throw new Error('bits exhausted')
}

export function parseTokens(
  trees: Record<number, HuffmanTree | null>,
  data: Uint8Array,
  offset: number,
): number[] {
  const result: number[] = []
  const stringBits = bitsOf(data, offset)

  let huffmanTree = trees[0xfe]
  while (huffmanTree) {
    const treeBits = bitsOf(huffmanTree.tree)
    let tokensSkipCounter = 0

    while (true) {
      const treeBit = treeBits.next().value
      if (treeBit !== 0) {
        const token = huffmanTree.tokens.at(-1 - tokensSkipCounter)!
        if (token === 0xfe) return result

        result.push(token)

        huffmanTree = trees[token]
        break
      }

      const stringBit = stringBits.next().value
      if (stringBit === 1) {
        tokensSkipCounter += decodeHuffmanTreeShape(treeBits).leafCount
      }
    }
  }
  return result
}

export function parseString(
  trees: Record<number, HuffmanTree | null>,
  data: Uint8Array,
  offset: number,
): string {
  const tokens = parseTokens(trees, data, offset)
  return tokens
    .map((token, i) => {
      const prev = tokens[i - 1]
      return prev === 0xfc || prev === 0xfd ? token.toString(16) : (TOKEN_TO_CHAR[token] ?? '�')
    })
    .join('')
}

export function parseDialogPage(
  trees: Record<number, HuffmanTree | null>,
  data: Uint8Array,
): string[] {
  const result: string[] = []
  let pagePointer = 0
  for (let i = 0; i < STRINGS_PER_PAGE && pagePointer < data.length; i++) {
    const lineLength = data[pagePointer] ?? 0
    if (lineLength === 0 || lineLength === 0xff) break
    if (pagePointer + 1 + lineLength > data.length) break
    result.push(parseString(trees, data, pagePointer + 1))
    pagePointer += lineLength + 1
  }
  return result
}

export function parseDialogPages(
  trees: Record<number, HuffmanTree | null>,
  bytes: Uint8Array,
  dialogOffsetsPointer: number,
): string[] {
  const result: string[] = []
  for (let off = dialogOffsetsPointer; off + 4 <= bytes.length; off += 4) {
    const begin = (readU32be(bytes, off) ?? 0) - OFFSET
    if (begin < 0 || begin + 1 > bytes.length) break
    const pageBytes = bytes.subarray(begin)
    result.push(...parseDialogPage(trees, pageBytes))
  }
  return result
}

export function parseDialog(data: Uint8Array): string[] {
  const dialogPointer = (readU32be(data, 0) ?? 0) - OFFSET
  const treeOffsetsPointer = (readU32be(data, 0x40) ?? 0) - OFFSET
  const treeDataPointer = (readU32be(data, 0x4a) ?? 0) - OFFSET

  const offsetsRegion = data.subarray(treeOffsetsPointer, treeDataPointer)
  const treeData = data.subarray(treeDataPointer, dialogPointer)

  const count = offsetsRegion.length >> 1
  const huffmanTreeOffsets = Array.from<number>({ length: count }).map(
    (_, i) => (offsetsRegion[i * 2]! << 8) | offsetsRegion[i * 2 + 1]!,
  )

  const trees = huffmanTreeOffsets.map((offset) =>
    offset === 0xffff ? null : splitTree(treeData, offset),
  )

  return parseDialogPages(trees, data, dialogPointer)
}
