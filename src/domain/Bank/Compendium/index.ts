import {
  decodeCompendiumData,
  type CompendiumNames,
  type CompendiumItem,
  type CompendiumMonster,
} from './decode'

export { type CompendiumNames, type CompendiumItem, type CompendiumMonster }

export default class Compendium {
  readonly names: CompendiumNames
  readonly items: CompendiumItem[]
  readonly monsters: CompendiumMonster[]
  readonly spells: Uint8Array
  bytes: Uint8Array

  constructor(
    names: CompendiumNames,
    items: CompendiumItem[],
    monsters: CompendiumMonster[],
    spells: Uint8Array,
    bytes: Uint8Array = new Uint8Array(),
  ) {
    this.names = names
    this.items = items
    this.monsters = monsters
    this.spells = spells
    this.bytes = bytes
  }

  static decode(bytes: Uint8Array): Compendium {
    const { names, items, monsters, spells } = decodeCompendiumData(bytes)
    return new Compendium(names, items, monsters, spells, bytes)
  }
}
