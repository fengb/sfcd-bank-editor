import { decodeCampGraphic, type CampGraphic } from './decode'

export { type CampGraphic }

import type { Palette, Tile } from '../BattleSprites/graphics'

export default class CampGraphics {
  readonly graphic: CampGraphic | null
  readonly bytes: Uint8Array

  constructor(graphic: CampGraphic | null = null, bytes: Uint8Array = new Uint8Array()) {
    this.graphic = graphic
    this.bytes = bytes
  }

  static decode(bytes: Uint8Array): CampGraphics {
    return new CampGraphics(decodeCampGraphic(bytes), bytes)
  }

  get tiles(): Tile[] {
    return this.graphic?.tiles ?? []
  }

  get palette(): Palette | null {
    return this.graphic?.palette ?? null
  }

  get metadata(): Uint8Array {
    return this.graphic?.metadata ?? new Uint8Array()
  }
}
