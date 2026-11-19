import { describe, expect, it } from 'vitest'

import { Bank } from './Bank'

describe('Bank', () => {
  describe('isDummy', () => {
    it('detects the DUMMY sentinel', () => {
      expect(Bank.decode(new Uint8Array([0x44, 0x55, 0x4d, 0x4d, 0x59]))).toBeNull()
      // expect(Bank.decode(new Uint8Array(5))).toBe(false)
    })
  })
})
