import { decode } from './decode'

export default class Unknown90 {
  bytes: Uint8Array = new Uint8Array()
  unknown: unknown

  book: number = 0
  battle: number = 0

  private constructor() {}

  static decode(bytes: Uint8Array): Unknown90 | null {
    const r = new Unknown90()
    try {
      if (!decode(r, bytes)) return null
    } catch {
      return null
    }
    return r
  }
}
