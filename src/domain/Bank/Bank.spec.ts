import { describe, expect, it } from 'vitest'

import { Bank } from './Bank'

function setU32be(data: Uint8Array, offset: number, value: number): void {
  data[offset] = (value >>> 24) & 0xff
  data[offset + 1] = (value >>> 16) & 0xff
  data[offset + 2] = (value >>> 8) & 0xff
  data[offset + 3] = value & 0xff
}

describe('Bank', () => {
  describe('slotSize', () => {
    it('returns null when extent is canonical', () => {
      const data = new Uint8Array(0x11000)
      data[0x2c] = 0x01 // non-zero extent
      const bank = new Bank(data)
      expect(bank.toc.enemyBattleSprites.slotSize()).toBeNull()
    })

    it('derives slot size from target distance', () => {
      const data = new Uint8Array(0x11000)
      setU32be(data, 0x28, 0x10020) // address
      setU32be(data, 0x20, 0x10060) // target read at address - 0x10000
      const bank = new Bank(data)
      expect(bank.toc.enemyBattleSprites.slotSize()).toBe(0x40)
    })

    it('returns error when the target precedes the metadata', () => {
      const data = new Uint8Array(0x11000)
      setU32be(data, 0x8, 0x10000) // header 0x08 address; target read at 0x0000 is 0
      const bank = new Bank(data)
      expect(bank.toc.mapTiles.slotSize()).toBe('error')
    })

    it('returns -- when the slot stride is implausibly large', () => {
      const data = new Uint8Array(0x11000)
      setU32be(data, 0x8, 0x10000) // header 0x08 address
      setU32be(data, 0x0, 0x20000) // target read at 0x0000
      const bank = new Bank(data)
      expect(bank.toc.mapTiles.slotSize()).toBe('--')
    })
  })

  describe('isDummy', () => {
    it('detects the DUMMY sentinel', () => {
      expect(new Bank(new Uint8Array([0x44, 0x55, 0x4d, 0x4d, 0x59])).isDummy).toBe(true)
      expect(new Bank(new Uint8Array(5)).isDummy).toBe(false)
    })
  })
})
