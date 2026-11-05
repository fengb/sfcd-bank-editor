import { readU16be, readU32be } from '../util'

/** RAM base used by the pointer header; subtracting it yields file offsets. */
export const RAM_BASE = 0x233200

export interface CompendiumNames {
  items: string[]
  classes: string[]
  spells: string[]
  characters: string[]
  monsters: string[]
}

export function* readString(data: Uint8Array, offset: number): Generator<[string, number]> {
  while (offset < data.length) {
    const len = data[offset++]!
    if (len >= 0x80 || offset + len > data.length) return
    const name = [...data.subarray(offset, offset + len)]
      .map((c) => (c === 0x0d ? ' ' : String.fromCharCode(c)))
      .join('')

    yield [name, offset]

    offset += len
  }
}

export interface CompendiumStats {
  items: number
  spells: number
  monsters: number
}

export interface CompendiumItem {
  mask: number
  range: [number, number]
  price: number
  flags: number
  useSpell: number
  equip: number[]
}

export interface CompendiumMonster {
  index: number
  level: number
  hp: number
  field0e: number
  mp: number
  atk: number
  def: number
  agi: number
  mov: number
  field1a: number
  field1e: number
  inventory: number[]
  spells: number[]
  field2c: number
  field2e: number
  aiClass: number
  field34: number
}

export interface CompendiumData {
  names: CompendiumNames
  items: CompendiumItem[]
  monsters: CompendiumMonster[]
  spells: Uint8Array
}

export function parseHeader(
  bytes: Uint8Array,
  headerNumber: number,
): { headerNumber: number; offset: number } {
  const pointer = readU32be(bytes, headerNumber * 4) ?? 0
  return { headerNumber, offset: pointer - RAM_BASE }
}

export function decodeCompendiumData(bytes: Uint8Array): CompendiumData {
  const nameOffsets = {
    items: parseHeader(bytes, 0).offset,
    classes: parseHeader(bytes, 1).offset,
    spells: parseHeader(bytes, 2).offset,
    characters: parseHeader(bytes, 3).offset,
    monsters: parseHeader(bytes, 4).offset,
  }

  const names: CompendiumNames = {
    items: [],
    classes: [],
    spells: [],
    characters: [],
    monsters: [],
  }

  const sortedOffsets = Object.entries(nameOffsets).map(([key, offset]) => ({ key, offset }))
  let current = sortedOffsets.shift()!
  const startingOffset = current.offset
  for (const [name, offset] of readString(bytes, startingOffset)) {
    const next = sortedOffsets[0]
    if (next && next.offset <= offset) {
      current = sortedOffsets.shift()!
    }
    names[current.key as keyof CompendiumNames]!.push(name)
  }

  const itemOffset = parseHeader(bytes, 5).offset
  const spellOffset = parseHeader(bytes, 6).offset
  const monsterOffset = parseHeader(bytes, 7).offset

  const items: CompendiumItem[] = []
  for (let i = 0; i < 64; i++) {
    const base = bytes.subarray(itemOffset + i * 16)
    if (base.length < 16) break
    items.push({
      mask: readU32be(base, 0x00) ?? 0,
      range: [base[0x05]!, base[0x04]!],
      price: readU16be(base, 0x06),
      flags: base[0x08]!,
      useSpell: base[0x09]!,
      equip: [...base.subarray(0x0a, 0x10)],
    })
  }

  const monsters: CompendiumMonster[] = []
  for (let i = 0; i < 71; i++) {
    const base = bytes.subarray(monsterOffset + i * 0x38)
    if (base.length < 0x38) break
    monsters.push({
      index: readU16be(base, 0x00),
      level: readU16be(base, 0x0a),
      hp: readU16be(base, 0x0c),
      field0e: readU16be(base, 0x0e),
      mp: base[0x10]!,
      atk: base[0x12]!,
      def: base[0x14]!,
      agi: base[0x16]!,
      mov: base[0x18]!,
      field1a: readU16be(base, 0x1a),
      field1e: readU16be(base, 0x1e),
      inventory: Array.from({ length: 4 }, (_, s) => readU16be(base, 0x20 + s * 2)),
      spells: [...base.subarray(0x28, 0x28 + 4)],
      field2c: readU16be(base, 0x2c),
      field2e: readU16be(base, 0x2e),
      aiClass: readU16be(base, 0x30),
      field34: readU16be(base, 0x34),
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
