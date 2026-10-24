import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { Bank } from '@/domain/bank'

export interface BankFile {
  name: string
  bytes: Uint8Array
}

function describe(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

const STORAGE_KEY = 'sfcd-bank-editor:file'

/** `''` stands in for "nothing saved", so a corrupt value just reads as empty. */
const SERIALIZER = {
  read: (raw: string): BankFile | null => {
    if (raw === '') return null
    const stored = JSON.parse(raw) as {
      name: string
      bytes: string
    }
    return {
      name: stored.name,
      bytes: Uint8Array.fromBase64(stored.bytes),
    }
  },
  write: (value: BankFile | null): string => {
    if (value === null) return ''
    return JSON.stringify({
      name: value.name,
      bytes: value.bytes.toBase64(),
    })
  },
}

export const useBankFileStore = defineStore('bankFile', () => {
  const file = useLocalStorage<BankFile | null>(STORAGE_KEY, null, {
    shallow: true,
    deep: false,
    writeDefaults: false,
    listenToStorageChanges: false,
    serializer: SERIALIZER,
  })

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const bytes = computed<Uint8Array | null>(() => file.value?.bytes ?? null)

  const bank = computed<Bank | null>(() => (file.value ? new Bank(file.value.bytes) : null))

  /** Read the first file in `source` fully into memory. */
  async function load(source: File | undefined): Promise<void> {
    if (!source) {
      file.value = null
      error.value = 'No file was provided.'
      return
    }
    error.value = null

    isLoading.value = true
    try {
      const buffer = await source.arrayBuffer()
      file.value = {
        name: source.name,
        bytes: new Uint8Array(buffer),
      }
    } catch (cause) {
      file.value = null
      error.value = `Could not read "${source.name}": ${describe(cause)}`
    } finally {
      isLoading.value = false
    }
  }

  function clear(): void {
    file.value = null
    error.value = null
    isLoading.value = false
  }

  return { file, bytes, bank, isLoading, error, load, clear }
})
