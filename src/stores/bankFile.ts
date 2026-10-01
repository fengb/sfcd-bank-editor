import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export interface BankFile {
  name: string
  type: string
  lastModified: number
  data: Uint8Array
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
      type: string
      lastModified: number
      data: string
    }
    return {
      name: stored.name,
      type: stored.type,
      lastModified: stored.lastModified,
      data: Uint8Array.fromBase64(stored.data),
    }
  },
  write: (value: BankFile | null): string => {
    if (value === null) return ''
    return JSON.stringify({
      name: value.name,
      type: value.type,
      lastModified: value.lastModified,
      data: value.data.toBase64(),
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

  const data = computed<Uint8Array | null>(() => file.value?.data ?? null)

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
        type: source.type,
        lastModified: source.lastModified,
        data: new Uint8Array(buffer),
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

  return { file, data, isLoading, error, load, clear }
})
