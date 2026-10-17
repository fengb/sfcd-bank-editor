import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useBankFileStore } from './bank'

function makeFile(name: string, bytes: number[]): File {
  return new File([new Uint8Array(bytes)], name, {
    type: 'application/octet-stream',
    lastModified: 1_700_000_000_000,
  })
}

describe('bankFile store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('reads a file into a Uint8Array', async () => {
    const store = useBankFileStore()
    await store.load(makeFile('BANK00.BIN', [0xde, 0xad, 0xbe, 0xef]))

    expect(store.file?.bytes).toBeInstanceOf(Uint8Array)
    expect(store.file?.bytes.length).toBe(4)
    expect(Array.from(store.file?.bytes ?? [])).toEqual([0xde, 0xad, 0xbe, 0xef])
    expect(store.error).toBeNull()
  })

  it('reports an error when there is nothing to read', async () => {
    const store = useBankFileStore()
    await store.load(undefined)

    expect(store.file).toBeNull()
    expect(store.error).toBe('No file was provided.')
  })

  it('clears the in-memory buffer', async () => {
    const store = useBankFileStore()
    await store.load(makeFile('BANK00.BIN', [1, 2, 3]))
    store.clear()

    expect(store.file).toBeNull()
  })
})
