import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useBankFileStore } from './bankFile'

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

    expect(store.data).toBeInstanceOf(Uint8Array)
    expect(store.data?.length).toBe(4)
    expect(Array.from(store.data ?? [])).toEqual([0xde, 0xad, 0xbe, 0xef])
    expect(store.error).toBeNull()
  })

  it('keeps the file metadata', async () => {
    const store = useBankFileStore()
    await store.load(makeFile('BANK0A.BIN', [1, 2, 3]))

    expect(store.file?.name).toBe('BANK0A.BIN')
    expect(store.file?.data.length).toBe(3)
    expect(store.file?.type).toBe('application/octet-stream')
    expect(store.file?.lastModified).toBe(1_700_000_000_000)
  })

  it('reports an error when there is nothing to read', async () => {
    const store = useBankFileStore()
    await store.load(undefined)

    expect(store.data).toBeNull()
    expect(store.error).toBe('No file was provided.')
  })

  it('clears the in-memory buffer', async () => {
    const store = useBankFileStore()
    await store.load(makeFile('BANK00.BIN', [1, 2, 3]))
    store.clear()

    expect(store.data).toBeNull()
  })
})
