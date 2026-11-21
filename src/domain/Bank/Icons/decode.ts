import { convertTiles, decodeStackGraphics, type Palette } from '../BattleSprites/graphics'
import { extractSections } from '../util'
import type Icons from './Icons'

export const ICON_PALETTE: Palette = [
  [0, 0, 0],
  [7, 7, 7],
  [0, 0, 0],
  [2, 2, 2],
  [4, 4, 4],
  [0, 5, 2],
  [2, 3, 6],
  [7, 4, 2],
  [7, 6, 5],
  [7, 2, 4],
  [6, 1, 1],
  [7, 6, 2],
  [4, 2, 0],
  [2, 1, 0],
  [0, 3, 1],
  [0, 1, 4],
]

export function decode(target: Icons, data: Uint8Array): boolean {
  if (data.length < 32) return false
  const sections = extractSections(data, 0x236e00, {
    actionMenu: 0x00,
    itemMenu: 0x04,
    battleMenu: 0x08,
    empty1: 0x0a,
    shopMenu: 0x10,
    hqMenu: 0x14,
    memberMenu: 0x18,
    empty2: 0x1a,
    items: 0x20,
  })
  target.actionMenu = convertTiles([...sections.actionMenu])
  target.itemMenu = decodeStackGraphics(sections.itemMenu)!
  target.battleMenu = decodeStackGraphics(sections.battleMenu)!
  target.shopMenu = decodeStackGraphics(sections.shopMenu)!
  target.hqMenu = decodeStackGraphics(sections.hqMenu)!
  target.memberMenu = decodeStackGraphics(sections.memberMenu)!
  target.items = convertTiles([...sections.items])
  return true
}
