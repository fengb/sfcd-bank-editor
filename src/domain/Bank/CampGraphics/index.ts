import { decodeCampGraphic, type CampGraphic } from './decode'

export { type CampGraphic }

import type { Palette, Tile } from '../BattleSprites/graphics'

export default class CampGraphics {
  readonly graphic: CampGraphic | null

  constructor(graphic: CampGraphic | null = null) {
    this.graphic = graphic
  }

  static decode(bytes: Uint8Array): CampGraphics {
    return new CampGraphics(decodeCampGraphic(bytes))
  }

  get palettes(): Palette[] {
    return this.graphic?.palettes ?? []
  }

  get tilesets(): Tile[][] {
    return this.graphic?.tilesets ?? []
  }
}
