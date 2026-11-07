import type { Palette, Tile } from '../BattleSprites/graphics'
import { decodeChapterGraphic, type ChapterGraphic } from './decode'

export default class ChapterGraphics {
  readonly graphic: ChapterGraphic | null
  readonly bytes: Uint8Array

  constructor(graphic: ChapterGraphic | null = null, bytes: Uint8Array = new Uint8Array()) {
    this.graphic = graphic
    this.bytes = bytes
  }

  static decode(bytes: Uint8Array): ChapterGraphics {
    return new ChapterGraphics(decodeChapterGraphic(bytes), bytes)
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
