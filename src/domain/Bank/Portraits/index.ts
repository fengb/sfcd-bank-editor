import { decodePortraits, type Portrait } from './decode'

export { type Portrait }
export { decodePortraits }
export * from './decode'
export * from './graphics'

export default class Portraits {
  readonly portraits: Portrait[]
  readonly bytes: Uint8Array

  constructor(portraits: Portrait[] = [], bytes: Uint8Array = new Uint8Array()) {
    this.portraits = portraits
    this.bytes = bytes
  }

  static decode(bytes: Uint8Array): Portraits {
    return new Portraits(decodePortraits(bytes), bytes)
  }

  get items(): Portrait[] {
    return this.portraits
  }

  get sprites(): Portrait[] {
    return this.portraits
  }
}
