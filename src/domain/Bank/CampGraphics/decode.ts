import { decodeStackGraphics, parsePalette } from '../BattleSprites/graphics'
import { extractSections } from '../util'
import type CampGraphics from './CampGraphics'

const BASE = 0x236e00

const PALETTE_SIZE = 0x20

export function decode(target: CampGraphics, data: Uint8Array): boolean {
  const sections = extractSections(data, BASE, {
    palettes: 0x00,
    0: 0x04,
    1: 0x08,
    2: 0x0c,
    3: 0x10,
  })

  const palettes = Array.from({ length: 4 }, (_, i) =>
    parsePalette(sections.palettes.subarray(i * PALETTE_SIZE, (i + 1) * PALETTE_SIZE)),
  )

  const tilesets = [
    decodeStackGraphics(sections[0])!,
    decodeStackGraphics(sections[1])!,
    decodeStackGraphics(sections[2])!,
    decodeStackGraphics(sections[3])!,
  ]
  if (tilesets.some((t) => !t)) return false

  target.palettes = palettes
  target.tilesets = tilesets
  return true
}
