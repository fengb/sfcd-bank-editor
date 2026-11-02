import { decodeWeaponSprites, type WeaponSprite } from './decode'

export default class WeaponSprites {
  constructor(readonly sprites: WeaponSprite[] = []) {}

  static decode(bytes: Uint8Array): WeaponSprites {
    return new WeaponSprites(decodeWeaponSprites(bytes))
  }

  get items(): WeaponSprite[] {
    return this.sprites
  }

  get weapons(): WeaponSprite[] {
    return this.sprites
  }
}
