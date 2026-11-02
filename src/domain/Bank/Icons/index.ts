import { decodeIcons, type Icon } from './decode'

export { type Icon }
export { decodeIcons }
export * from './decode'
export * from './graphics'

import type { Palette, Tile } from './graphics'

export default class Icons {
  readonly icon: Icon | null

  constructor(icons: Icon | null = null) {
    this.icon = icons
  }

  static decode(bytes: Uint8Array): Icons {
    return new Icons(decodeIcons(bytes))
  }

  get graphic(): Icon | null {
    return this.icon
  }

  get tiles(): Tile[] {
    return this.icon?.tiles ?? []
  }

  get palette(): Palette {
    return this.icon?.palette!
  }
}
