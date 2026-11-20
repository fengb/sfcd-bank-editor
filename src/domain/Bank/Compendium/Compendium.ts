import { decode } from './decode'

export interface CompendiumNames {
  items: string[]
  classes: string[]
  spells: string[]
  characters: string[]
  monsters: string[]
}

export interface CompendiumStats {
  items: number
  spells: number
  monsters: number
}

export interface CompendiumItem {
  itemId: number
  mask: number
  range: [number, number]
  price: number
  flags: number
  useSpell: number
  equip: number[]
}

export interface CompendiumMonster {
  monsterId: number
  index: number
  level: number
  hp: number
  mp: number
  atk: number
  def: number
  agi: number
  mov: number
  unknown1a: number
  spellResist: number
  unknown1c: number[]
  inventory: number[]
  spells: number[]
  unitClass: number
  unknown32: number[]
}

export default class Compendium {
  names: CompendiumNames = { items: [], classes: [], spells: [], characters: [], monsters: [] }
  items: CompendiumItem[] = []
  monsters: CompendiumMonster[] = []
  spells: Uint8Array = new Uint8Array()

  private constructor() {}

  static decode(bytes: Uint8Array): Compendium | null {
    const r = new Compendium()
    try {
      if (!decode(r, bytes)) return null
    } catch {
      return null
    }
    return r
  }
}
