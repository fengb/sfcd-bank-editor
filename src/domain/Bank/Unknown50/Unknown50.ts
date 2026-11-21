import { decode } from './decode'

export default class Unknown50 {
  bytes: Uint8Array = new Uint8Array()
  unknown: unknown

  private constructor() {}

  static decode(bytes: Uint8Array): Unknown50 | null {
    const r = new Unknown50()
    try {
      if (!decode(r, bytes)) return null
    } catch {
      return null
    }
    return r
  }
}
