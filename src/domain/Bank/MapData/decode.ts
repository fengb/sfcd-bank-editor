import { chunk, takeWhile } from 'es-toolkit'

import { parsePalette, type Palette } from '../BattleSprites/graphics'
import { decodeSegments, readU16be } from '../util'
import { decodeBlocks, type DecodedTile } from './decodeBlocks'
import { decodeLayout, type LayoutEntry } from './decodeLayout'

const MAINCPU_WORDRAM_LOADING_OFFSET = 0x23de00

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

  palette: Palette | null
  decodedBlocks: DecodedTile[]
  decodedLayout: LayoutEntry[]
  areas: MapArea[]
  flagCopies: MapFlagCopy[]
  stepCopies: MapStepCopy[]
  layer2Copies: MapLayer2Copy[]
  warps: MapWarp[]
  chestItems: MapItem[]
  otherItems: MapItem[]
  animation: MapAnimation | null
}

function parseAreas(data: Uint8Array): MapArea[] {
  return takeWhile(chunk([...data], 30), (entry) => entry[0] !== 0xff || entry[1] !== 0xff).map(
    (entry) => ({
      layer1StartX: readU16be(entry, +0),
      layer1StartY: readU16be(entry, +2),
      layer1EndX: readU16be(entry, +4),
      layer1EndY: readU16be(entry, +6),
      foregroundLayer2StartX: readU16be(entry, +8),
      foregroundLayer2StartY: readU16be(entry, +10),
      backgroundLayer2StartX: readU16be(entry, +12),
      backgroundLayer2StartY: readU16be(entry, +14),
      layer1ParallaxX: readU16be(entry, +16),
      layer1ParallaxY: readU16be(entry, +18),
      layer2ParallaxX: readU16be(entry, +20),
      layer2ParallaxY: readU16be(entry, +22),
      layer1AutoscrollX: entry[+24]!,
      layer1AutoscrollY: entry[+25]!,
      layer2AutoscrollX: entry[+26]!,
      layer2AutoscrollY: entry[+27]!,
      layerType: entry[+28]!,
      defaultMusic: entry[+29]!,
    }),
  )
}

function parseFlagCopies(data: Uint8Array): MapFlagCopy[] {
  return takeWhile(chunk([...data], 8), (entry) => entry[0] !== 0xff || entry[1] !== 0xff).map(
    (entry) => ({
      flag: readU16be(entry, 0),
      sourceX: entry[+2]!,
      sourceY: entry[+3]!,
      width: entry[+4]!,
      height: entry[+5]!,
      destX: entry[+6]!,
      destY: entry[+7]!,
    }),
  )
}

function parseStepCopies(data: Uint8Array): MapStepCopy[] {
  return takeWhile(chunk([...data], 8), (entry) => entry[0] !== 0xff).map((entry) => ({
    triggerX: entry[0]!,
    triggerY: entry[1]!,
    sourceX: entry[2]!,
    sourceY: entry[+3]!,
    width: entry[+4]!,
    height: entry[+5]!,
    destX: entry[+6]!,
    destY: entry[+7]!,
  }))
}

function parseWarps(data: Uint8Array): MapWarp[] {
  return takeWhile(chunk([...data], 8), (entry) => entry[0] !== 0xff || entry[1] !== 0xff).map(
    (entry) => ({
      triggerX: entry[0]!,
      triggerY: entry[1]!,
      destMap: String(entry[3]),
      destX: entry[4]!,
      destY: entry[5]!,
      facing: String(entry[6]),
    }),
  )
}

function parseItems(data: Uint8Array): MapItem[] {
  return takeWhile(chunk([...data], 4), (entry) => entry[0] !== 0xff && entry[1] !== 0xff).map(
    (entry) => ({
      x: entry[0]!,
      y: entry[1]!,
      flag: entry[2]!,
      item: String(data[3]),
    }),
  )
}

function parseAnimation(data: Uint8Array): MapAnimation | null {
  if (data.length < 4) return null
  const tileset = readU16be(data, 0)
  const length = readU16be(data, 2)
  const frames = takeWhile(
    chunk([...data.subarray(4)], 8),
    (entry) => entry[0] !== 0xff && entry[1] !== 0xff,
  ).map((entry) => ({
    start: readU16be(entry, 0),
    length: readU16be(entry, 2),
    dest: readU16be(entry, 4),
    delay: readU16be(entry, 6),
  }))
  return { tileset, length, frames }
}

export function decodeMapData(data: Uint8Array): MapDataRegions | null {
  try {
    if (!data || data.length < 2) return null

    const header = readU16be(data, 0)

    const segments = decodeSegments(data, MAINCPU_WORDRAM_LOADING_OFFSET, {
      palette: 0x02,
      blocks: 0x06,
      layout: 0x0a,
      areas: 0x0e,
      flagCopies: 0x12,
      stepCopies: 0x16,
      layer2Copies: 0x1a,
      warps: 0x1e,
      chestItems: 0x22,
      otherItems: 0x26,
      animations: 0x2a,
    })

    return {
      header,
      palette: parsePalette(segments.palette),
      decodedBlocks: decodeBlocks(segments.blocks),
      decodedLayout: decodeLayout(segments.layout),
      areas: parseAreas(segments.areas),
      flagCopies: parseFlagCopies(segments.flagCopies),
      stepCopies: parseStepCopies(segments.stepCopies),
      layer2Copies: parseStepCopies(segments.layer2Copies),
      warps: parseWarps(segments.warps),
      chestItems: parseItems(segments.chestItems),
      otherItems: parseItems(segments.otherItems),
      animation: parseAnimation(segments.animations),
    }
  } catch {
    return null
  }
}
