import { decodePortraits, type Portrait } from './decode'

export default class Portraits {
  readonly portraits: Portrait[]

  constructor(portraits: Portrait[] = []) {
    this.portraits = portraits
  }

  static decode(bytes: Uint8Array): Portraits {
    return new Portraits(decodePortraits(bytes))
  }

  get items(): Portrait[] {
    return this.portraits
  }

  get sprites(): Portrait[] {
    return this.portraits
  }
}
