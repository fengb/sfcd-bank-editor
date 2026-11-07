import { isEqual } from 'es-toolkit'

import { BitReader } from '../util'

export type LayoutTerrain = 'open' | 'stairsRight' | 'stairsLeft' | 'blocked'

export const INTERACTIONS = [
  'none',
  'step',
  'hideRoofs',
  'showRoofs',
  'warp',
  'trigger',
  'chest',
  'search',
  'layerUp',
  'layerDown',
  'table',
  'vase',
  'barrel',
  'shelf',
  'caravan',
  'raft',
] as const

export type LayoutInteraction = (typeof INTERACTIONS)[number]

export interface LayoutEntry {
  block: number
  terrain: LayoutTerrain
  interaction: LayoutInteraction
}

export function decodeLayout(data: Uint8Array): LayoutEntry[] {
  const entries: LayoutEntry[] = Array.from({ length: 64 * 32 }, () => ({
    block: 0,
    terrain: 'open',
    interaction: 'none',
  }))

  const leftHistory = new Map<number, LayoutEntry[]>()
  const upperHistory = new Map<number, LayoutEntry[]>()

  let blockCursor = 2
  let entryCursor = 0
  const reader = new BitReader(data)

  function saveStack(map: Map<number, LayoutEntry[]>, key: number, entry: LayoutEntry): void {
    const currentStack = map.get(key) ?? []
    const newStack = [entry, ...currentStack.filter((e) => !isEqual(e, entry)).slice(0, 3)]
    map.set(key, newStack)
  }

  function decodeFlags(): { terrain: LayoutTerrain; interaction: LayoutInteraction } {
    const flags = reader.nextPrefixCodeLookup({
      '00': { terrain: 'open', interaction: 'none' },
      '01': { terrain: 'blocked', interaction: 'none' },
      '100': { terrain: 'stairsRight', interaction: 'none' },
      '101': { terrain: 'stairsLeft', interaction: 'none' },
      '110': { terrain: 'open' },
      '111': { terrain: 'blocked' },
    })!
    if (!flags.interaction) {
      const bits = reader.nextBitsValue(5)
      flags.interaction = INTERACTIONS[bits] ?? 'none'
    }
    return flags as { terrain: LayoutTerrain; interaction: LayoutInteraction }
  }

  while (entryCursor < 64 * 32) {
    const op = reader.nextPrefixCodeLookup({
      '1': 'reference',
      '00': 'literal',
      '01': 'copyRun',
    })!

    if (op === 'literal') {
      blockCursor++
      const flags = decodeFlags()
      const entry: LayoutEntry = { block: blockCursor, ...flags }
      entries[entryCursor] = entry
      const leftEntry = entries[entryCursor - 1]
      const upperEntry = entries[entryCursor - 64]
      saveStack(leftHistory, leftEntry?.block ?? 0, entry)
      saveStack(upperHistory, upperEntry?.block ?? 0, entry)
      entryCursor++
    } else if (op === 'copyRun') {
      const count = reader.nextZeroes()
      const value = reader.nextBitsValue(count)
      const totalCopies = value + (1 << count)
      const offset = reader.nextBit() === 1 ? 1 : 64
      for (let i = 0; i < totalCopies; i++) {
        if (entryCursor >= 64 * 32) break
        const sourceIndex = entryCursor - offset
        if (sourceIndex < 0 || !entries[sourceIndex]) break
        entries[entryCursor] = { ...entries[sourceIndex]! }
        entryCursor++
      }
    } else if (op === 'reference') {
      const leftEntry = entries[entryCursor - 1]
      const upperEntry = entries[entryCursor - 64]

      const leftStack = leftHistory.get(leftEntry?.block ?? 0) ?? []
      const leftAvailable = leftStack.length > 0
      const upperStack = upperHistory.get(upperEntry?.block ?? 0) ?? []
      const upperAvailable = upperStack.length > 0

      let commandType = 2
      if (leftAvailable && upperAvailable) {
        commandType = reader.nextPrefixCodeLookup({
          '0': 0,
          '10': 1,
          '11': 2,
        })!
      } else if (leftAvailable) {
        commandType = reader.nextPrefixCodeLookup({
          '0': 0,
          '1': 2,
        })!
      } else if (upperAvailable) {
        commandType = reader.nextPrefixCodeLookup({
          '0': 1,
          '1': 2,
        })!
      }

      let targetEntry: LayoutEntry | undefined
      if (commandType === 0 || commandType === 1) {
        const stack = commandType === 0 ? leftStack : upperStack
        const targetIndex = reader.nextZeroes(stack.length - 1)
        targetEntry = stack[targetIndex]
      } else {
        const length = blockCursor.toString(2).length
        const value = reader.nextBitsValue(length)
        const flags = decodeFlags()
        targetEntry = { block: value, ...flags }
      }

      if (targetEntry) {
        entries[entryCursor] = { ...targetEntry }
        const leftEntry = entries[entryCursor - 1]
        const upperEntry = entries[entryCursor - 64]
        saveStack(leftHistory, leftEntry?.block ?? 0, targetEntry)
        saveStack(upperHistory, upperEntry?.block ?? 0, targetEntry)
      }
      entryCursor++
    }
  }
  return entries
}
