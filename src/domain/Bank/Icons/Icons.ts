import type { Palette, Tile } from '../BattleSprites/graphics'
import { ICON_PALETTE, decode } from './decode'

export default class Icons {
  palette: Palette = ICON_PALETTE
  actionMenu: Tile[] = []
  itemMenu: Tile[] = []
  battleMenu: Tile[] = []
  shopMenu: Tile[] = []
  campMenu: Tile[] = []
  memberMenu: Tile[] = []
  items: Tile[] = []

  private constructor() {}

  static decode(bytes: Uint8Array): Icons | null {
    const r = new Icons()
    try {
      if (!decode(r, bytes)) return null
    } catch {
      return null
    }
    return r
  }
}
