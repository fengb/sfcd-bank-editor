import { parsePalette, type Palette } from '../BattleSprites/graphics'
import { readU16be, readU32be } from '../util'

const MAINCPU_WORDRAM_LOADING_OFFSET = 0x23de00

function readI16be(data: Uint8Array, cursor: number): number {
  if (cursor + 1 >= data.length) return 0
  const value = (data[cursor]! << 8) | data[cursor + 1]!
  return value >= 0x8000 ? value - 0x10000 : value
}

function readU8(data: Uint8Array, cursor: number): number {
  return cursor < data.length ? data[cursor]! : 0
}

export interface MapArea {
  layer1StartX: number
  layer1StartY: number
  layer1EndX: number
  layer1EndY: number
  foregroundLayer2StartX: number
  foregroundLayer2StartY: number
  backgroundLayer2StartX: number
  backgroundLayer2StartY: number
  layer1ParallaxX: number
  layer1ParallaxY: number
  layer2ParallaxX: number
  layer2ParallaxY: number
  layer1AutoscrollX: number
  layer1AutoscrollY: number
  layer2AutoscrollX: number
  layer2AutoscrollY: number
  layerType: number
  defaultMusic: number
}

export interface MapFlagCopy {
  flag: number
  sourceX: number
  sourceY: number
  width: number
  height: number
  destX: number
  destY: number
}

export interface MapStepCopy {
  triggerX: number
  triggerY: number
  sourceX: number
  sourceY: number
  width: number
  height: number
  destX: number
  destY: number
}

export interface MapLayer2Copy {
  triggerX: number
  triggerY: number
  sourceX: number
  sourceY: number
  width: number
  height: number
  destX: number
  destY: number
}

export interface MapWarp {
  triggerX: number
  triggerY: number
  destMap: string
  destX: number
  destY: number
  facing: string
}

export interface MapItem {
  x: number
  y: number
  flag: number
  item: string
}

export interface MapAnimationFrame {
  start: number
  length: number
  dest: number
  delay: number
}

export interface MapAnimation {
  tileset: number
  length: number
  frames: MapAnimationFrame[]
}

export interface MapDataRegions {
  header: number
  pointers: number[]

  palette: Palette | null
  paletteBytes: Uint8Array

  blocks: Uint8Array
  blockBytes: Uint8Array

  layout: Uint8Array
  layoutBytes: Uint8Array

  areas: MapArea[]
  areasBytes: Uint8Array

  flagCopies: MapFlagCopy[]
  flagCopiesBytes: Uint8Array

  stepCopies: MapStepCopy[]
  stepCopiesBytes: Uint8Array

  layer2Copies: MapLayer2Copy[]
  layer2CopiesBytes: Uint8Array

  warps: MapWarp[]
  warpsBytes: Uint8Array

  chestItems: MapItem[]
  chestItemsBytes: Uint8Array

  otherItems: MapItem[]
  otherItemsBytes: Uint8Array

  animation: MapAnimation | null
  animationBytes: Uint8Array | null

  bytes: Uint8Array
}

export type MapData = MapDataRegions

function resolvePointer(data: Uint8Array, pointer: number): number {
  if (pointer === 0 || pointer === 0xffffffff) return -1
  const offset = pointer - MAINCPU_WORDRAM_LOADING_OFFSET
  if (offset < 0 || offset >= data.length) return -1
  return offset
}

function sliceRegion(data: Uint8Array, pointer: number, size: number): Uint8Array {
  const offset = resolvePointer(data, pointer)
  if (offset < 0) return new Uint8Array()
  const end = Math.min(data.length, offset + size)
  return data.subarray(offset, end)
}

function parseAreas(data: Uint8Array): MapArea[] {
  const result: MapArea[] = []
  let cursor = 0
  while (cursor + 30 <= data.length) {
    const first = readI16be(data, cursor)
    if (first === -1) break
    result.push({
      layer1StartX: readI16be(data, cursor + 0),
      layer1StartY: readI16be(data, cursor + 2),
      layer1EndX: readI16be(data, cursor + 4),
      layer1EndY: readI16be(data, cursor + 6),
      foregroundLayer2StartX: readI16be(data, cursor + 8),
      foregroundLayer2StartY: readI16be(data, cursor + 10),
      backgroundLayer2StartX: readI16be(data, cursor + 12),
      backgroundLayer2StartY: readI16be(data, cursor + 14),
      layer1ParallaxX: readI16be(data, cursor + 16),
      layer1ParallaxY: readI16be(data, cursor + 18),
      layer2ParallaxX: readI16be(data, cursor + 20),
      layer2ParallaxY: readI16be(data, cursor + 22),
      layer1AutoscrollX: readU8(data, cursor + 24),
      layer1AutoscrollY: readU8(data, cursor + 25),
      layer2AutoscrollX: readU8(data, cursor + 26),
      layer2AutoscrollY: readU8(data, cursor + 27),
      layerType: readU8(data, cursor + 28),
      defaultMusic: readU8(data, cursor + 29),
    })
    cursor += 30
  }
  return result
}

function parseFlagCopies(data: Uint8Array): MapFlagCopy[] {
  const result: MapFlagCopy[] = []
  let cursor = 0
  while (cursor + 8 <= data.length) {
    const flag = readI16be(data, cursor)
    if (flag === -1) break
    result.push({
      flag,
      sourceX: readU8(data, cursor + 2),
      sourceY: readU8(data, cursor + 3),
      width: readU8(data, cursor + 4),
      height: readU8(data, cursor + 5),
      destX: readU8(data, cursor + 6),
      destY: readU8(data, cursor + 7),
    })
    cursor += 8
  }
  return result
}

function parseStepCopies(data: Uint8Array): MapStepCopy[] {
  const result: MapStepCopy[] = []
  let cursor = 0
  while (cursor + 8 <= data.length) {
    const triggerX = readU8(data, cursor)
    if (triggerX === 0xff) break
    result.push({
      triggerX,
      triggerY: readU8(data, cursor + 1),
      sourceX: readU8(data, cursor + 2),
      sourceY: readU8(data, cursor + 3),
      width: readU8(data, cursor + 4),
      height: readU8(data, cursor + 5),
      destX: readU8(data, cursor + 6),
      destY: readU8(data, cursor + 7),
    })
    cursor += 8
  }
  return result
}

function parseLayer2Copies(data: Uint8Array): MapLayer2Copy[] {
  const base = parseStepCopies(data)
  return base.map((s) => ({ ...s }))
}

function parseWarps(data: Uint8Array): MapWarp[] {
  const result: MapWarp[] = []
  let cursor = 0
  while (cursor + 8 <= data.length) {
    const triggerX = readU8(data, cursor)
    const triggerY = readU8(data, cursor + 1)
    if (triggerX === 0xff && triggerY === 0xff) break
    result.push({
      triggerX,
      triggerY,
      destMap: String(readU8(data, cursor + 3)),
      destX: readU8(data, cursor + 4),
      destY: readU8(data, cursor + 5),
      facing: String(readU8(data, cursor + 6)),
    })
    cursor += 8
  }
  return result
}

function parseItems(data: Uint8Array): MapItem[] {
  const result: MapItem[] = []
  let cursor = 0
  while (cursor + 4 <= data.length) {
    const x = readU8(data, cursor)
    const y = readU8(data, cursor + 1)
    if (x === 0xff && y === 0xff) break
    result.push({
      x,
      y,
      flag: readU8(data, cursor + 2),
      item: String(readU8(data, cursor + 3)),
    })
    cursor += 4
  }
  return result
}

function parseAnimation(data: Uint8Array): MapAnimation | null {
  if (data.length < 4) return null
  const tileset = readI16be(data, 0)
  const length = readI16be(data, 2)
  const frames: MapAnimationFrame[] = []
  let cursor = 4
  while (cursor + 8 <= data.length) {
    const start = readI16be(data, cursor)
    if (start === -1) break
    frames.push({
      start,
      length: readI16be(data, cursor + 2),
      dest: readI16be(data, cursor + 4),
      delay: readI16be(data, cursor + 6),
    })
    cursor += 8
  }
  return { tileset, length, frames }
}

export function decodeMapData(data: Uint8Array): MapDataRegions | null {
  try {
    if (!data || data.length < 2) return null

    const header = readU16be(data, 0)

    const pointers: number[] = []
    const maxEntries = Math.min(16, Math.floor((data.length - 2) / 4))
    for (let i = 0; i < maxEntries; i++) {
      const pointer = readU32be(data, 2 + i * 4) ?? 0
      pointers.push(pointer)
      if (pointer === 0 || pointer === 0xffffffff) break
    }

    const paletteBytes = sliceRegion(data, pointers[0] ?? 0, 0x20)
    let palette: Palette | null = null
    try {
      if (paletteBytes.length >= 0x20) palette = parsePalette(paletteBytes)
    } catch {
      palette = null
    }

    const blocks = sliceRegion(data, pointers[1] ?? 0, 0x1000)
    const layout = sliceRegion(data, pointers[2] ?? 0, 0x1000)
    const areasBytes = sliceRegion(data, pointers[3] ?? 0, 0x100)
    const flagCopiesBytes = sliceRegion(data, pointers[4] ?? 0, 0x100)
    const stepCopiesBytes = sliceRegion(data, pointers[5] ?? 0, 0x100)
    const layer2CopiesBytes = sliceRegion(data, pointers[6] ?? 0, 0x100)
    const warpsBytes = sliceRegion(data, pointers[7] ?? 0, 0x100)
    const chestItemsBytes = sliceRegion(data, pointers[8] ?? 0, 0x100)
    const otherItemsBytes = sliceRegion(data, pointers[9] ?? 0, 0x100)
    const animationPointer = pointers[10] ?? 0
    const animationBytes =
      animationPointer && animationPointer !== 0xffffffff
        ? sliceRegion(data, animationPointer, 0x100)
        : null

    return {
      header,
      pointers,
      palette,
      paletteBytes,
      blocks,
      blockBytes: blocks,
      layout,
      layoutBytes: layout,
      areas: parseAreas(areasBytes),
      areasBytes,
      flagCopies: parseFlagCopies(flagCopiesBytes),
      flagCopiesBytes,
      stepCopies: parseStepCopies(stepCopiesBytes),
      stepCopiesBytes,
      layer2Copies: parseLayer2Copies(layer2CopiesBytes),
      layer2CopiesBytes,
      warps: parseWarps(warpsBytes),
      warpsBytes,
      chestItems: parseItems(chestItemsBytes),
      chestItemsBytes,
      otherItems: parseItems(otherItemsBytes),
      otherItemsBytes,
      animation: animationBytes ? parseAnimation(animationBytes) : null,
      animationBytes,
      bytes: data,
    }
  } catch {
    return null
  }
}
