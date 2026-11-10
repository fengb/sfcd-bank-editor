import { ByteReader, readU16be, readU32be } from '../util'

/** RAM base used by the pointer header; subtracting it yields file offsets. */
export const RAM_BASE = 0x233200

export interface CompendiumNames {
  items: string[]
  classes: string[]
  spells: string[]
  characters: string[]
  monsters: string[]
}

export function decodeString(data: Uint8Array): string[] {
  const names: string[] = []
  const reader = new ByteReader(data)
  while (reader.bytesRemaining() > 0) {
    const len = reader.nextU8()
    if (len > 0x80) return names
    if (len === 0x80) {
      const refIndex = reader.nextU8()
      if (refIndex == undefined) return names
      const name = names[refIndex] ?? ''
      names.push(name)
      continue
    }
    const name = reader
      .nextBytes(len)
      .map((c) => (c === 0x0d ? ' ' : String.fromCharCode(c)))
      .join('')

    names.push(name)
  }
  return names
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

export interface CompendiumData {
  names: CompendiumNames
  items: CompendiumItem[]
  monsters: CompendiumMonster[]
  spells: Uint8Array
}

export function parseHeader(bytes: Uint8Array, headerNumber: number): number {
  const pointer = readU32be(bytes, headerNumber * 4) ?? 0
  return pointer - RAM_BASE
}

export function decodeCompendiumData(bytes: Uint8Array): CompendiumData {
  const nameOffsets = {
    items: parseHeader(bytes, 0),
    classes: parseHeader(bytes, 1),
    spells: parseHeader(bytes, 2),
    characters: parseHeader(bytes, 3),
    monsters: parseHeader(bytes, 4),
  }

  const names: CompendiumNames = {
    items: [],
    classes: [],
    spells: [],
    characters: [],
    monsters: [],
  }

  names.items = decodeString(bytes.subarray(nameOffsets.items, nameOffsets.classes))
  names.classes = decodeString(bytes.subarray(nameOffsets.classes, nameOffsets.spells))
  names.spells = decodeString(bytes.subarray(nameOffsets.spells, nameOffsets.characters))
  names.characters = decodeString(bytes.subarray(nameOffsets.characters, nameOffsets.monsters))
  names.monsters = decodeString(bytes.subarray(nameOffsets.monsters))

  const itemOffset = parseHeader(bytes, 5)
  const spellOffset = parseHeader(bytes, 6)
  const monsterOffset = parseHeader(bytes, 7)

  const items: CompendiumItem[] = []
  for (let i = 0; i < names.items.length; i++) {
    const base = bytes.subarray(itemOffset + i * 16)
    if (base.length < 16) break
    items.push({
      itemId: i,
      mask: readU32be(base, 0x00) ?? 0,
      range: [base[0x05]!, base[0x04]!],
      price: readU16be(base, 0x06),
      flags: base[0x08]!,
      useSpell: base[0x09]!,
      equip: [...base.subarray(0x0a, 0x10)],
    })
  }

  const monsters: CompendiumMonster[] = []
  for (let i = 0; i < names.monsters.length; i++) {
    const base = bytes.subarray(monsterOffset + i * 0x38)
    if (base.length < 0x38) break
    // Unreferenced bytes (0x01 - 0x0a, 0x11, 0x1c, etc) are confirmed zeroes
    monsters.push({
      monsterId: i,
      index: base[0x00]!,
      level: base[0x0b]!,
      hp: readU16be(base, 0x0c),
      mp: base[0x10]!,
      atk: base[0x12]!,
      def: base[0x14]!,
      agi: base[0x16]!,
      mov: base[0x18]!,
      unknown1a: base[0x1a]!,
      spellResist: base[0x1b]!,
      unknown1c: [...base.subarray(0x1c, 0x20)],
      inventory: Array.from({ length: 4 }, (_, s) => readU16be(base, 0x20 + s * 2)),
      spells: [...base.subarray(0x28, 0x28 + 4)],
      unitClass: base[0x31]!,
      unknown32: [...base.subarray(0x32, 0x38)],
    })
  }

  const spells = bytes.subarray(spellOffset, spellOffset + 576)

  return {
    names,
    items,
    monsters,
    spells,
  }
}
