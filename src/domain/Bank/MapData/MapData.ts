import type { Palette } from '../BattleSprites/graphics'
import { decode } from './decode'
import type { DecodedTile } from './decodeBlocks'
import type { LayoutEntry } from './decodeLayout'

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

export default class MapData {
  header: number = 0

  palette!: Palette
  blocks: DecodedTile[] = []
  layout: LayoutEntry[] = []
  areas: MapArea[] = []
  flagCopies: MapFlagCopy[] = []
  stepCopies: MapStepCopy[] = []
  layer2Copies: MapLayer2Copy[] = []
  warps: MapWarp[] = []
  chestItems: MapItem[] = []
  otherItems: MapItem[] = []
  animation: MapAnimation | null = null

  private constructor() {}

  static decode(bytes: Uint8Array): MapData | null {
    const r = new MapData()
    try {
      if (!decode(r, bytes)) return null
    } catch {
      return null
    }
    return r
  }
}
