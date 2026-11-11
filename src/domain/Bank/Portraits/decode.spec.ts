import { describe, it, expect } from 'vitest'

import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { decodePortraits } from './decode'

const here = dirname(fileURLToPath(import.meta.url))
const REGION_OFFSET = 0x6028e - 0x10000

describe('decodePortraits', () => {
  it('decodes the BANKD0A portraits region without hanging', async () => {
    const buf = await readFile(join(here, 'decode.test.bin'))
    // Re-create the original byteOffset so decodePortraits' pointer math works.
    const buffer = new ArrayBuffer(REGION_OFFSET + buf.byteLength)
    new Uint8Array(buffer, REGION_OFFSET).set(buf)
    const bytes = new Uint8Array(buffer, REGION_OFFSET, buf.byteLength)

    const portraits = decodePortraits(bytes)
    expect(portraits).toHaveLength(33)
    for (const portrait of portraits) {
      expect(portrait.baseTiles).toHaveLength(48)
    }
  })
})
