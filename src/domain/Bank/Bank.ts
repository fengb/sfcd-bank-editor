import { mapValues } from 'es-toolkit'

import { formatHex } from '@/components/BytesViewer/hex'
import { splitBits } from '@/utils/bits'

import Backgrounds from './Backgrounds'
import BattleData from './BattleData'
import BattleSprites from './BattleSprites'
import ChapterGraphics from './ChapterGraphics'
import Character from './Character'
import Compendium from './Compendium'
import Dialog from './Dialog'
import HqGraphics from './HqGraphics'
import Icons from './Icons'
import MapData from './MapData'
import MapSprites from './MapSprites'
import MapTilesets from './MapTilesets'
import Portraits from './Portraits'
import Unknown48 from './Unknown48'
import Unknown50 from './Unknown50'
import Unknown90 from './Unknown90'
import WeaponSprites from './WeaponSprites'
import { readU32be } from './util'

type RegionConfig<TRegion> = {
  tocEntry: number
  codec: {
    decode: (bytes: Uint8Array) => TRegion | null
    encode?: (region: TRegion) => Uint8Array
  }
}

export const tmpBytesCodec = {
  decode: (bytes: Uint8Array): Uint8Array => bytes,
}

export interface BankRegions {
  mapSprites: MapSprites
  mapTilesets: MapTilesets
  portraits: Portraits
  allyBattleSprites: BattleSprites
  weaponSprites: WeaponSprites
  enemyBattleSprites: BattleSprites
  backgrounds: Backgrounds
  grounds: Uint8Array
  spellGraphics: Uint8Array
  unknown48: Unknown48
  unknown50: Unknown50
  compendium: Compendium
  characterData: Character
  dialog: Dialog
  icons: Icons
  hqGraphics: HqGraphics
  mapData: MapData
  battleData: BattleData
  unknown90: Unknown90
  map2Tilesets: MapTilesets
  map2Data: MapData
  chapterGraphics: ChapterGraphics
  pad0: Uint8Array
  pad1: Uint8Array
  pad2: Uint8Array
  pad3: Uint8Array
  pad4: Uint8Array
  pad5: Uint8Array
  pad6: Uint8Array
  pad7: Uint8Array
  pad8: Uint8Array
  pad9: Uint8Array
}

export type BankToc = {
  entryOffset: number
  address: number
  size: number
  bytes: Uint8Array
}

const CONFIG: { [K in keyof BankRegions]: RegionConfig<BankRegions[K]> } = {
  mapSprites: { tocEntry: 0x00, codec: MapSprites },
  mapTilesets: { tocEntry: 0x08, codec: MapTilesets },

  portraits: { tocEntry: 0x10, codec: Portraits },
  allyBattleSprites: { tocEntry: 0x18, codec: BattleSprites },

  weaponSprites: { tocEntry: 0x20, codec: WeaponSprites },
  enemyBattleSprites: { tocEntry: 0x28, codec: BattleSprites },

  backgrounds: { tocEntry: 0x30, codec: Backgrounds },
  grounds: { tocEntry: 0x38, codec: tmpBytesCodec },

  spellGraphics: { tocEntry: 0x40, codec: tmpBytesCodec },
  unknown48: { tocEntry: 0x48, codec: Unknown48 },

  unknown50: { tocEntry: 0x50, codec: Unknown50 },
  compendium: { tocEntry: 0x58, codec: Compendium },

  characterData: { tocEntry: 0x60, codec: Character },
  dialog: { tocEntry: 0x68, codec: Dialog },

  icons: { tocEntry: 0x70, codec: Icons },
  hqGraphics: { tocEntry: 0x78, codec: HqGraphics },

  mapData: { tocEntry: 0x80, codec: MapData },
  battleData: { tocEntry: 0x88, codec: BattleData },

  unknown90: { tocEntry: 0x90, codec: Unknown90 },
  map2Tilesets: { tocEntry: 0x98, codec: MapTilesets },

  map2Data: { tocEntry: 0xa0, codec: MapData },
  chapterGraphics: { tocEntry: 0xa8, codec: ChapterGraphics },

  pad0: { tocEntry: 0xb0, codec: tmpBytesCodec },
  pad1: { tocEntry: 0xb8, codec: tmpBytesCodec },
  pad2: { tocEntry: 0xc0, codec: tmpBytesCodec },
  pad3: { tocEntry: 0xc8, codec: tmpBytesCodec },
  pad4: { tocEntry: 0xd0, codec: tmpBytesCodec },
  pad5: { tocEntry: 0xd8, codec: tmpBytesCodec },
  pad6: { tocEntry: 0xe0, codec: tmpBytesCodec },
  pad7: { tocEntry: 0xe8, codec: tmpBytesCodec },
  pad8: { tocEntry: 0xf0, codec: tmpBytesCodec },
  pad9: { tocEntry: 0xf8, codec: tmpBytesCodec },
}

export class BankDecoder {
  constructor(readonly bytes: Uint8Array) {}

  get toc(): Record<keyof BankRegions, BankToc> {
    const toc = {} as Record<keyof BankRegions, BankToc>
    for (const [k, meta] of Object.entries(CONFIG)) {
      const key = k as keyof BankRegions
      const BASE = 0x10000
      const address = readU32be(this.bytes, meta.tocEntry) ?? 0
      const size = readU32be(this.bytes, meta.tocEntry + 4) ?? 0
      const offset = address - BASE
      const last = offset + (size || this.bytes.length)
      const bytes = this.bytes.subarray(offset, last)

      toc[key] = { entryOffset: meta.tocEntry, address, size, bytes }
    }
    return toc
  }

  decode(): BankRegions {
    return mapValues(this.toc, (value, key) => CONFIG[key].codec.decode(value.bytes)) as BankRegions
  }
}

export class Bank {
  readonly decoder?: BankDecoder
  readonly regions: BankRegions

  constructor(props: { regions: BankRegions; decoder?: BankDecoder }) {
    this.regions = props.regions
    this.decoder = props.decoder
  }

  static decode(bankBytes: Uint8Array): Bank | null {
    if (bankBytes.length === 5 && String.fromCharCode(...bankBytes) === 'DUMMY') {
      return null
    }

    const decoder = new BankDecoder(bankBytes)
    const regions = decoder.decode()

    return new Bank({ regions, decoder })
  }
}

export function decodeSpell(value: number): string {
  if (value === 0x3f) return ' --'
  const [flags, idx] = splitBits(value, [2, 6])
  const flagsDisplay: Record<number, string> = {
    0: '¹',
    1: '²',
    2: '³',
    3: '⁴',
  }
  return `${formatHex(idx, 2)}${flagsDisplay[flags]}`
}
