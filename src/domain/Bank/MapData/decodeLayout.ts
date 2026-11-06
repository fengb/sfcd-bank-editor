import { isEqual } from 'es-toolkit'

import { BitReader } from '../util'

interface LayoutEntry {
  block: number
  flags: number
}

export function decodeLayout(data: Uint8Array): number[] {
  const blocks: number[] = new Array(64 * 64).fill(0)
  const cellFlags: number[] = new Array(64 * 64)

  const leftHistory = new Map<number, LayoutEntry[]>()
  const upperHistory = new Map<number, LayoutEntry[]>()

  let blocksetCursor = 2
  let blockCursor = 0
  const reader = new BitReader(data)

  function saveStack(map: Map<number, LayoutEntry[]>, key: number, entry: LayoutEntry): void {
    const currentStack = map.get(key) ?? []
    const newStack = [entry, ...currentStack.filter((e) => !isEqual(e, entry)).slice(0, 3)]
    map.set(key, newStack)
  }

  function decodeFlags(): number {
    const flags = reader.nextPrefixCodeLookup({
      '00': 0,
      '01': 0xc000,
      '100': 0x4000,
      '101': 0x8000,
      '110': -0x0000,
      '111': -0x8000,
    })!
    if (flags > 0 || Object.is(flags, 0)) {
      return flags
    }

    return -flags & (reader.nextBitsValue(5) << 10)
  }

  while (blockCursor < 64 * 64) {
    if (reader.nextBit() === 0) {
      if (reader.nextBit() === 0) {
        // 00 : output next block from block set
        blocksetCursor++
        const blockNumber = blocksetCursor
        const flags = decodeFlags()
        blocks[blockCursor] = blockNumber
        cellFlags[blockCursor] = flags
        const entry: LayoutEntry = { block: blockNumber, flags }
        const leftKey = blockCursor > 0 ? blocks[blockCursor - 1]! : 0
        const upperKey = blockCursor > 63 ? blocks[blockCursor - 64]! : 0
        saveStack(leftHistory, leftKey, entry)
        saveStack(upperHistory, upperKey, entry)
        blockCursor++
      } else {
        // 01 : copy section
        let count = 0
        while (reader.nextBit() === 0) count++
        const value = reader.nextBitsValue(count)
        const result = value + (1 << count)
        const offset = reader.nextBit() === 1 ? 1 : 64
        for (let i = 0; i < result; i++) {
          if (blockCursor < 64 * 64) {
            const sourceIndex = blockCursor - offset
            if (sourceIndex < 0 || blocks[sourceIndex] == null) break
            blocks[blockCursor] = blocks[sourceIndex]
            cellFlags[blockCursor] = cellFlags[sourceIndex]!
            blockCursor++
          }
        }
      }
    } else {
      // 1...
      const leftBlockCursor = blockCursor > 0 ? blocks[blockCursor - 1]! : 0
      const upperBlockCursor = blockCursor > 63 ? blocks[blockCursor - 64]! : 0

      const leftStack = leftHistory.get(leftBlockCursor)
      const leftAvailable = leftStack?.length! > 0
      const upperStack = upperHistory.get(upperBlockCursor)
      const upperAvailable = upperStack?.length! > 0

      let commandType = 2 // CUSTOM
      if (leftAvailable) {
        if (reader.nextBit() === 0) {
          commandType = 0 // LEFT
        } else {
          if (upperAvailable) {
            if (reader.nextBit() === 0) {
              commandType = 1 // UPPER
            } else {
              commandType = 2
            }
          } else {
            commandType = 2
          }
        }
      } else {
        if (upperAvailable) {
          if (reader.nextBit() === 0) {
            commandType = 1
          } else {
            commandType = 2
          }
        } else {
          commandType = 2
        }
      }

      let targetEntry: LayoutEntry | undefined
      if (commandType < 2) {
        const stack = (commandType === 0 ? leftStack : upperStack) ?? []

        let stackTarget = 0
        for (let i = 0; i < stack.length - 1; i++) {
          if (reader.nextBit() === 0) {
            stackTarget++
          } else {
            break
          }
        }
        targetEntry = stack[stackTarget]
      } else {
        const length = blocksetCursor.toString(2).length
        const value = reader.nextBitsValue(length)
        const flags = decodeFlags()
        targetEntry = { block: value, flags }
      }

      if (targetEntry) {
        blocks[blockCursor] = targetEntry.block
        cellFlags[blockCursor] = targetEntry.flags
        const entry: LayoutEntry = { block: targetEntry.block, flags: targetEntry.flags }
        const leftKey = blockCursor > 0 ? blocks[blockCursor - 1]! : 0
        const upperKey = blockCursor > 63 ? blocks[blockCursor - 64]! : 0
        saveStack(leftHistory, leftKey, entry)
        saveStack(upperHistory, upperKey, entry)
      }
      blockCursor++
    }
  }

  return blocks
}
