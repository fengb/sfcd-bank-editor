import { formatHex } from '@/panes/BytesViewer/hex'

export function readU32be(data: Uint8Array, offset: number): number | null {
  if (offset < 0 || offset + 4 > data.length) return null
  return (
    ((data[offset + 0]! << 24) |
      (data[offset + 1]! << 16) |
      (data[offset + 2]! << 8) |
      data[offset + 3]!) >>>
    0
  )
}

export type SlotSize = number | null | 'error' | '--'

export type BankRegion = Uint8Array & { offset: number }

export class BankToc {
  address: number
  extent: number

  constructor(
    readonly bytes: Uint8Array,
    readonly entryOffset: number,
  ) {
    this.address = readU32be(this.bytes, entryOffset) ?? 0
    this.extent = readU32be(this.bytes, entryOffset + 4) ?? 0
  }

  /** Alias for `entryOffset`, matching the legacy TOC object's `offset` field. */
  get offset(): number {
    return this.entryOffset
  }

  region(): BankRegion {
    const offset = this.address - 0x10000
    return Object.assign(this.bytes.subarray(offset, offset + this.extent), { offset })
  }

  slotSize(): SlotSize {
    // Extent is canonical. Don't derive anything if this exists.
    if (this.extent) {
      return null
    }

    // Distance between first entry and first entry's target.
    const target = readU32be(this.bytes, this.address - 0x10000) ?? 0
    const slotSize = target - this.address

    if (slotSize < 0) {
      // Data is thoroughly messed up -- target is before the metadata
      return 'error'
    } else if (slotSize > 0x1000) {
      // Slot stride is massive -- (probably) not a slot
      return '--'
    }

    return slotSize
  }
}

export class Bank {
  constructor(readonly bytes: Uint8Array) {}

  get toc() {
    return {
      mapSprites: new BankToc(this.bytes, 0x00),
      mapTiles: new BankToc(this.bytes, 0x08),

      portraits: new BankToc(this.bytes, 0x10),
      allyBattleSprites: new BankToc(this.bytes, 0x18),

      weaponSprites: new BankToc(this.bytes, 0x20),
      enemyBattleSprites: new BankToc(this.bytes, 0x28),

      backgrounds: new BankToc(this.bytes, 0x30),
      grounds: new BankToc(this.bytes, 0x38), // ???

      spellGraphics: new BankToc(this.bytes, 0x40),
      unknown0: new BankToc(this.bytes, 0x48),

      unknown1: new BankToc(this.bytes, 0x50),
      namesItemsMonsters: new BankToc(this.bytes, 0x58),

      characterData: new BankToc(this.bytes, 0x60),
      texts: new BankToc(this.bytes, 0x68),

      icons: new BankToc(this.bytes, 0x70),
      churchShopGraphics: new BankToc(this.bytes, 0x78),

      mapData: new BankToc(this.bytes, 0x80), // clarify name
      battleData: new BankToc(this.bytes, 0x88), // clarify name

      unknownA: new BankToc(this.bytes, 0x90), // "Shared WRAM pointer table"
      unknownB: new BankToc(this.bytes, 0x98), // "Pointer table into 0xA0"

      unknownC: new BankToc(this.bytes, 0xa0),
      chapterGraphics: new BankToc(this.bytes, 0xa8),

      pad0: new BankToc(this.bytes, 0xb0),
      pad1: new BankToc(this.bytes, 0xb8),

      pad2: new BankToc(this.bytes, 0xc0),
      pad3: new BankToc(this.bytes, 0xc8),

      pad4: new BankToc(this.bytes, 0xd0),
      pad5: new BankToc(this.bytes, 0xd8),

      pad6: new BankToc(this.bytes, 0xe0),
      pad7: new BankToc(this.bytes, 0xe8),

      pad8: new BankToc(this.bytes, 0xf0),
      pad9: new BankToc(this.bytes, 0xf8),
    }
  }

  /** Unused banks are 5-byte stubs reading "DUMMY" */
  get isDummy(): boolean {
    return this.bytes.length === 5 && String.fromCharCode(...this.bytes) === 'DUMMY'
  }
}

export function decodeSpell(value: number): string {
  if (value === 0x3f) return ' --'
  const idx = value & 0x3f
  const flags = value & 0xc0
  const flagsDisplay: Record<number, string> = {
    [0x00]: '¹',
    [0x40]: '²',
    [0x80]: '³',
    [0xc0]: '⁴',
  }
  return `${formatHex(idx, 2)}${flagsDisplay[flags]}`
}
