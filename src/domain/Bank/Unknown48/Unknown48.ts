import { decode } from './decode'

export default class Unknown48 {
  bytes: Uint8Array = new Uint8Array()
  unknown: unknown

  private constructor() {}

  static decode(bytes: Uint8Array): Unknown48 | null {
    const r = new Unknown48()
    try {
      if (!decode(r, bytes)) return null
    } catch {
      return null
    }
    return r
  }
}
