import type { Palette } from '../BattleSprites/graphics'
import {
  decodeMapData,
  type MapDataRegions,
  type MapArea,
  type MapFlagCopy,
  type MapStepCopy,
  type MapLayer2Copy,
  type MapWarp,
  type MapItem,
  type MapAnimation,
} from './decode'
import type { DecodedTile } from './decodeBlocks'
import type { LayoutEntry } from './decodeLayout'

export default class MapData {
  readonly data: MapDataRegions | null
  readonly bytes: Uint8Array

  constructor(data: MapDataRegions | null = null, bytes: Uint8Array = new Uint8Array()) {
    this.data = data
    this.bytes = bytes
  }

  static decode(bytes: Uint8Array): MapData {
    return new MapData(decodeMapData(bytes), bytes)
  }

  get header(): number {
    return this.data?.header ?? 0
  }

  get palette(): Palette | null {
    return this.data?.palette ?? null
  }

  get decodedBlocks(): DecodedTile[] {
    return this.data?.decodedBlocks ?? []
  }

  get decodedLayout(): LayoutEntry[] {
    return this.data?.decodedLayout ?? []
  }

  get areas(): MapArea[] {
    return this.data?.areas ?? []
  }

  get flagCopies(): MapFlagCopy[] {
    return this.data?.flagCopies ?? []
  }

  get stepCopies(): MapStepCopy[] {
    return this.data?.stepCopies ?? []
  }

  get layer2Copies(): MapLayer2Copy[] {
    return this.data?.layer2Copies ?? []
  }

  get warps(): MapWarp[] {
    return this.data?.warps ?? []
  }

  get chestItems(): MapItem[] {
    return this.data?.chestItems ?? []
  }

  get otherItems(): MapItem[] {
    return this.data?.otherItems ?? []
  }

  get animation(): MapAnimation | null {
    return this.data?.animation ?? null
  }

  get graphic(): MapDataRegions | null {
    return this.data
  }
}
