import { chunk } from 'es-toolkit'

import { ByteReader, extractSegments, readU16be, readU32be } from '../util'

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

export function decodeCompendiumData(bytes: Uint8Array): CompendiumData {
  const segments = extractSegments(bytes, RAM_BASE, {
    itemNames: 0x00,
    classNames: 0x04,
    spellNames: 0x08,
    characterNames: 0x0c,
    monsterNames: 0x10,

    items: 0x14,
    spells: 0x18,
    monsters: 0x1c,
  })

  return {
    names: {
      items: decodeString(segments.itemNames),
      classes: decodeString(segments.classNames),
      spells: decodeString(segments.spellNames),
      characters: decodeString(segments.characterNames),
      monsters: decodeString(segments.monsterNames),
    },
    items: chunk([...segments.items], 16).map((entry, i) => ({
      itemId: i,
      mask: readU32be(entry, 0x00) ?? 0,
      range: [entry[0x05]!, entry[0x04]!] as [number, number],
      price: readU16be(entry, 0x06),
      flags: entry[0x08]!,
      useSpell: entry[0x09]!,
      equip: entry.slice(0x0a),
    })),
    monsters: chunk([...segments.monsters], 0x38).map((entry, i) => ({
      monsterId: i,
      index: entry[0x00]!,
      level: entry[0x0b]!,
      hp: readU16be(entry, 0x0c),
      mp: entry[0x10]!,
      atk: entry[0x12]!,
      def: entry[0x14]!,
      agi: entry[0x16]!,
      mov: entry[0x18]!,
      unknown1a: entry[0x1a]!,
      spellResist: entry[0x1b]!,
      unknown1c: entry.slice(0x1c, 0x20),
      inventory: Array.from({ length: 4 }, (_, s) => readU16be(entry, 0x20 + s * 2)),
      spells: entry.slice(0x28, 0x28 + 4),
      unitClass: entry[0x31]!,
      unknown32: entry.slice(0x32),
    })),
    spells: segments.spells,
  }
}
