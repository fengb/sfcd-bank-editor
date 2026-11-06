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
export { decodeMapData } from './decode'

import type { Palette } from '../BattleSprites/graphics'

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

  get pointers(): number[] {
    return this.data?.pointers ?? []
  }

  get palette(): Palette | null {
    return this.data?.palette ?? null
  }

  get paletteBytes(): Uint8Array {
    return this.data?.paletteBytes ?? new Uint8Array()
  }

  get blocks(): Uint8Array {
    return this.data?.blocks ?? new Uint8Array()
  }

  get blockBytes(): Uint8Array {
    return this.blocks
  }

  get layout(): Uint8Array {
    return this.data?.layout ?? new Uint8Array()
  }

  get layoutBytes(): Uint8Array {
    return this.layout
  }

  get areas(): MapArea[] {
    return this.data?.areas ?? []
  }

  get areasBytes(): Uint8Array {
    return this.data?.areasBytes ?? new Uint8Array()
  }

  get flagCopies(): MapFlagCopy[] {
    return this.data?.flagCopies ?? []
  }

  get flagCopiesBytes(): Uint8Array {
    return this.data?.flagCopiesBytes ?? new Uint8Array()
  }

  get stepCopies(): MapStepCopy[] {
    return this.data?.stepCopies ?? []
  }

  get stepCopiesBytes(): Uint8Array {
    return this.data?.stepCopiesBytes ?? new Uint8Array()
  }

  get layer2Copies(): MapLayer2Copy[] {
    return this.data?.layer2Copies ?? []
  }

  get layer2CopiesBytes(): Uint8Array {
    return this.data?.layer2CopiesBytes ?? new Uint8Array()
  }

  get warps(): MapWarp[] {
    return this.data?.warps ?? []
  }

  get warpsBytes(): Uint8Array {
    return this.data?.warpsBytes ?? new Uint8Array()
  }

  get chestItems(): MapItem[] {
    return this.data?.chestItems ?? []
  }

  get chestItemsBytes(): Uint8Array {
    return this.data?.chestItemsBytes ?? new Uint8Array()
  }

  get otherItems(): MapItem[] {
    return this.data?.otherItems ?? []
  }

  get otherItemsBytes(): Uint8Array {
    return this.data?.otherItemsBytes ?? new Uint8Array()
  }

  get animation(): MapAnimation | null {
    return this.data?.animation ?? null
  }

  get animationBytes(): Uint8Array | null {
    return this.data?.animationBytes ?? null
  }

  get graphic(): MapDataRegions | null {
    return this.data
  }
}
