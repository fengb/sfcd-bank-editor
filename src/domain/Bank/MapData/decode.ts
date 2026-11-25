import { chunk, takeWhile } from 'es-toolkit'

import { parsePalette } from '../BattleSprites/graphics'
import { extractSections, readU16be } from '../util'
import type { MapArea, MapAnimation, MapFlagCopy, MapItem, MapStepCopy, MapWarp } from './MapData'
import type MapData from './MapData'
import { decodeBlocks } from './decodeBlocks'
import { decodeLayout } from './decodeLayout'

const MAINCPU_WORDRAM_LOADING_OFFSET = 0x23de00

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
  return takeWhile(chunk([...data], 4), (entry) => entry[0] !== 0xff || entry[1] !== 0xff).map(
    (entry) => ({
      x: entry[0]!,
      y: entry[1]!,
      flag: entry[2]!,
      item: String(entry[3]),
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

export function decode(target: MapData, data: Uint8Array): boolean {
  if (!data || data.length < 2) return false

  const header = readU16be(data, 0)

  const sections = extractSections(data, MAINCPU_WORDRAM_LOADING_OFFSET, {
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

  target.header = header ?? 0
  target.palette = parsePalette(sections.palette)
  target.blocks = decodeBlocks(sections.blocks)
  target.layout = decodeLayout(sections.layout)
  target.areas = parseAreas(sections.areas)
  target.flagCopies = parseFlagCopies(sections.flagCopies)
  target.stepCopies = parseStepCopies(sections.stepCopies)
  target.layer2Copies = parseStepCopies(sections.layer2Copies)
  target.warps = parseWarps(sections.warps)
  target.chestItems = parseItems(sections.chestItems)
  target.otherItems = parseItems(sections.otherItems)
  target.animation = parseAnimation(sections.animations)
  return true
}
