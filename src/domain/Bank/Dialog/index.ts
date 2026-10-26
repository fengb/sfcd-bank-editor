import { decodeDialog } from './decode'

export default class Dialog {
  constructor(readonly strings: string[]) {}

  static decode(bytes: Uint8Array): Dialog {
    return new Dialog(decodeDialog(bytes))
  }
}
