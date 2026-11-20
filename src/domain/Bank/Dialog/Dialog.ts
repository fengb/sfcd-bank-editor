import { decode } from './decode'

export default class Dialog {
  strings: string[] = []

  private constructor() {}

  static decode(bytes: Uint8Array): Dialog | null {
    const r = new Dialog()
    try {
      if (!decode(r, bytes)) return null
    } catch {
      return null
    }
    return r
  }
}
