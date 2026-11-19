import type { Palette, Tile } from '../BattleSprites/graphics'
import { decodeChapterGraphic, type ChapterGraphic } from './decode'

export default class ChapterGraphics {
  readonly graphic: ChapterGraphic | null

  constructor(graphic: ChapterGraphic | null = null) {
    this.graphic = graphic
  }

  static decode(bytes: Uint8Array): ChapterGraphics {
    return new ChapterGraphics(decodeChapterGraphic(bytes))
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
