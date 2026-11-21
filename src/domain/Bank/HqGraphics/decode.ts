import { decodeStackGraphics, parsePalettes } from '../BattleSprites/graphics'
import { extractSections } from '../util'
import type HqGraphics from './HqGraphics'

const BASE = 0x236e00

export function decode(target: HqGraphics, data: Uint8Array): boolean {
  const sections = extractSections(data, BASE, {
    palettes: 0x00,
    camp: 0x04,
    noShop: 0x08,
    shop: 0x0c,
    text: 0x10,
  })

  target.palettes = parsePalettes(sections.palettes)

  target.camp = decodeStackGraphics(sections.camp)!
  target.noShop = decodeStackGraphics(sections.noShop)!
  target.shop = decodeStackGraphics(sections.shop)!
  target.text = decodeStackGraphics(sections.text)!

  return true
}
