function readU32be(data: Uint8Array, offset: number): number | null {
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

export type BankHeader = {
  offset: number
  address: number
  extent: number
}

export class Bank {
  constructor(readonly bytes: Uint8Array) {}

  get headers() {
    return {
      mapSprites: this.parseHeader(0x00),
      mapTiles: this.parseHeader(0x08),

      portraits: this.parseHeader(0x10),
      allyBattleSprites: this.parseHeader(0x18),

      weaponSprites: this.parseHeader(0x20),
      enemyBattleSprites: this.parseHeader(0x28),

      backgrounds: this.parseHeader(0x30),
      grounds: this.parseHeader(0x38), // ???

      spellGraphics: this.parseHeader(0x40),
      unknown0: this.parseHeader(0x48),

      unknown1: this.parseHeader(0x50),
      unknown2: this.parseHeader(0x58),

      characterData: this.parseHeader(0x60),
      texts: this.parseHeader(0x68),

      icons: this.parseHeader(0x70),
      churchShopGraphics: this.parseHeader(0x78),

      mapData: this.parseHeader(0x80), // clarify name
      battleData: this.parseHeader(0x88), // clarify name

      unknownA: this.parseHeader(0x90), // "Shared WRAM pointer table"
      unknownB: this.parseHeader(0x98), // "Pointer table into 0xA0"

      unknownC: this.parseHeader(0xa0),
      chapterGraphics: this.parseHeader(0xa8),

      pad0: this.parseHeader(0xb0),
      pad1: this.parseHeader(0xb8),

      pad2: this.parseHeader(0xc0),
      pad3: this.parseHeader(0xc8),

      pad4: this.parseHeader(0xd0),
      pad5: this.parseHeader(0xd8),

      pad6: this.parseHeader(0xe0),
      pad7: this.parseHeader(0xe8),

      pad8: this.parseHeader(0xf0),
      pad9: this.parseHeader(0xf8),
    }
  }

  parseHeader(offset: number) {
    const address = readU32be(this.bytes, offset) ?? 0
    const extent = readU32be(this.bytes, offset + 4) ?? 0
    return {
      offset,
      address,
      extent,
      bytes: this.bytes.slice(address - 0x10000, address - 0x10000 + extent),
    }
  }

  /** Unused banks are 5-byte stubs reading "DUMMY" */
  get isDummy(): boolean {
    return this.bytes.length === 5 && String.fromCharCode(...this.bytes) === 'DUMMY'
  }

  slotSize(header: BankHeader): SlotSize {
    // Extent is canonical. Don't derive anything if this exists.
    if (header.extent) {
      return null
    }

    // Distance between first entry and first entry's target.
    const target = readU32be(this.bytes, header.address - 0x10000) ?? 0
    const slotSize = target - header.address

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
