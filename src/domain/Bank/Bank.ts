import { formatHex } from '@/components/BytesViewer/hex'
import BattleSprites from '@/domain/Bank/BattleSprites'
import Character from '@/domain/Bank/Character'
import Dialog from '@/domain/Bank/Dialog'

import { readU32be } from './util'

export type SlotSize = number | null | 'error' | '--'

export type RegionFactory<TRegion> = {
  decode(bytes: Uint8Array): TRegion
}

// Remove once every Toc has a real parser
const tmpBytesFactory = {
  decode: (bytes: Uint8Array) => bytes,
}

const enemyBattleSpritesFactory = (bankBytes: Uint8Array): RegionFactory<BattleSprites> => ({
  decode: (bytes: Uint8Array) => {
    const ptOffset = readU32be(bankBytes, 0x28) ?? 0
    const portraitPointer = readU32be(bankBytes, 0x10) ?? 0
    if (ptOffset === portraitPointer) {
      return new BattleSprites([], bytes)
    }
    return BattleSprites.decode(bytes)
  },
})

export class BankToc<TRegion = unknown> {
  address: number
  extent: number

  constructor(
    readonly bytes: Uint8Array,
    readonly entryOffset: number,
    readonly factory: RegionFactory<TRegion>,
  ) {
    this.address = readU32be(this.bytes, entryOffset) ?? 0
    this.extent = readU32be(this.bytes, entryOffset + 4) ?? 0
  }

  region(): TRegion {
    const offset = this.address - 0x10000
    const size = this.extent > 0 ? this.extent : Math.max(0, this.bytes.length - offset)
    return this.factory.decode(this.bytes.subarray(offset, offset + size))
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
      mapSprites: new BankToc(this.bytes, 0x00, tmpBytesFactory),
      mapTiles: new BankToc(this.bytes, 0x08, tmpBytesFactory),

      portraits: new BankToc(this.bytes, 0x10, tmpBytesFactory),
      allyBattleSprites: new BankToc(this.bytes, 0x18, BattleSprites),

      weaponSprites: new BankToc(this.bytes, 0x20, tmpBytesFactory),
      enemyBattleSprites: new BankToc(this.bytes, 0x28, enemyBattleSpritesFactory(this.bytes)),

      backgrounds: new BankToc(this.bytes, 0x30, tmpBytesFactory),
      grounds: new BankToc(this.bytes, 0x38, tmpBytesFactory), // ???

      spellGraphics: new BankToc(this.bytes, 0x40, tmpBytesFactory),
      unknown0: new BankToc(this.bytes, 0x48, tmpBytesFactory),

      unknown1: new BankToc(this.bytes, 0x50, tmpBytesFactory),
      compendium: new BankToc(this.bytes, 0x58, tmpBytesFactory),

      characterData: new BankToc(this.bytes, 0x60, Character),
      dialog: new BankToc(this.bytes, 0x68, Dialog),

      icons: new BankToc(this.bytes, 0x70, tmpBytesFactory),
      churchShopGraphics: new BankToc(this.bytes, 0x78, tmpBytesFactory),

      mapData: new BankToc(this.bytes, 0x80, tmpBytesFactory), // clarify name
      battleData: new BankToc(this.bytes, 0x88, tmpBytesFactory), // clarify name

      unknownA: new BankToc(this.bytes, 0x90, tmpBytesFactory), // "Shared WRAM pointer table"
      unknownB: new BankToc(this.bytes, 0x98, tmpBytesFactory), // "Pointer table into 0xA0"

      unknownC: new BankToc(this.bytes, 0xa0, tmpBytesFactory),
      chapterGraphics: new BankToc(this.bytes, 0xa8, tmpBytesFactory),

      pad0: new BankToc(this.bytes, 0xb0, tmpBytesFactory),
      pad1: new BankToc(this.bytes, 0xb8, tmpBytesFactory),

      pad2: new BankToc(this.bytes, 0xc0, tmpBytesFactory),
      pad3: new BankToc(this.bytes, 0xc8, tmpBytesFactory),

      pad4: new BankToc(this.bytes, 0xd0, tmpBytesFactory),
      pad5: new BankToc(this.bytes, 0xd8, tmpBytesFactory),

      pad6: new BankToc(this.bytes, 0xe0, tmpBytesFactory),
      pad7: new BankToc(this.bytes, 0xe8, tmpBytesFactory),

      pad8: new BankToc(this.bytes, 0xf0, tmpBytesFactory),
      pad9: new BankToc(this.bytes, 0xf8, tmpBytesFactory),
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
