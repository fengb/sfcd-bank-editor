import { BitReader } from '../util'

export interface DecodedTile {
  tileId: number
  hFlip: boolean
  vFlip: boolean
  priority: boolean
}

function baseTile(tileId: number): DecodedTile {
  return { tileId, hFlip: false, vFlip: false, priority: false }
}

const INITIAL_BLOCKS = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0x1ae, 0x1af, 0x9ae, 0x1be, 0x1bf, 0x9be, 0x1ce, 0x1cf, 0x9ce],
  [0x1ac, 0x1ad, 0x9ac, 0x1bc, 0x1bd, 0x9bc, 0x1ce, 0x1cf, 0x9ce],
]
  .flat()
  .map(baseTile)

export function decodeBlocks(blockData: Uint8Array): DecodedTile[] {
  const rightTileHistory: DecodedTile[] = []
  const bottomTileHistory: DecodedTile[] = []

  const bits = new BitReader(blockData)

  const commandCount = bits.nextBitsValue(14)

  function lastTile(): DecodedTile {
    return { ...outputData.at(-1)! }
  }

  function neighborTile(): DecodedTile {
    const previous = outputData.at(-1)!
    const nextId = previous.hFlip ? previous.tileId - 1 : previous.tileId + 1
    return {
      tileId: nextId & 0x3ff, // resolve overflow / underflow
      hFlip: previous.hFlip,
      vFlip: previous.vFlip,
      priority: previous.priority,
    }
  }

  function rightHistoryTile(): DecodedTile {
    const left = outputData.at(-1)!
    const offset = left.tileId + (left.hFlip ? 0x400 : 0)
    const tile = rightTileHistory[offset]
    return tile ? { ...tile } : baseTile(0)
  }

  function bottomHistoryTile(): DecodedTile {
    const upper = outputData.at(-3)!
    const offset = upper.tileId + (upper.hFlip ? 0x400 : 0)
    const tile = bottomTileHistory[offset]
    return tile ? { ...tile } : baseTile(0)
  }

  function readRelativeTileValue(): number {
    const previous = outputData.at(-1)!
    let relativeValue = bits.nextBitsValue(5)
    if (bits.nextBit() === 1) relativeValue = -relativeValue
    return (previous.tileId + relativeValue) & 0x3ff
  }

  function readAbsoluteTileValue(): number {
    let value = bits.nextBitsValue(9)
    if (value >= 0x180) {
      value = value * 2 + bits.nextBit() - 0x180
    }
    return value & 0x3ff
  }

  function nextTile(priority: boolean, vFlip: boolean, hFlip: boolean): DecodedTile {
    let tileId: number
    if (bits.nextBit() === 0) {
      tileId = readRelativeTileValue()
    } else {
      tileId = readAbsoluteTileValue()
    }
    const left = outputData.at(-1)!
    const upper = outputData.at(-3)!
    const rightOffset = left.tileId + (left.hFlip ? 0x400 : 0)
    const bottomOffset = upper.tileId + (upper.hFlip ? 0x400 : 0)
    const tile: DecodedTile = { tileId, hFlip, vFlip, priority }
    rightTileHistory[rightOffset] = tile
    bottomTileHistory[bottomOffset] = tile
    return tile
  }

  function nextTileWithSameFlags(): DecodedTile {
    const previous = outputData.at(-1)!
    return nextTile(previous.priority, previous.vFlip, previous.hFlip)
  }

  function nextTileWithNewFlags(): DecodedTile {
    const highPriority = bits.nextBit() !== 0
    const vFlip = bits.nextBit() !== 0
    const hFlip = bits.nextBit() !== 0
    return nextTile(highPriority, vFlip, hFlip)
  }
  const outputData: DecodedTile[] = [...INITIAL_BLOCKS]

  try {
    for (let i = 0; i < commandCount; i++) {
      const makeTile = bits.nextPrefixCodeLookup({
        '00': lastTile,
        '01': neighborTile,
        '100': rightHistoryTile,
        '101': bottomHistoryTile,
        '110': nextTileWithSameFlags,
        '111': nextTileWithNewFlags,
      })
      outputData.push(makeTile!())
    }
  } catch {
    // fall through
  }

  return outputData
}
