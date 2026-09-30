import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

/** Everything we can pull a file out of: a drop handler's result, an `<input>`, or a single file. */
export type FileSource = File | File[] | FileList | null | undefined

export interface LoadedFile {
  name: string
  type: string
  lastModified: number
  /** The entire file, held in memory. */
  data: Uint8Array
}

/** Normalise any accepted source into a plain array of files. */
export function toFileArray(source: FileSource): File[] {
  if (source == null) return []
  if (source instanceof File) return [source]
  return Array.from(source as ArrayLike<File>)
}

function describe(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

/** localStorage holds strings, so the bytes go out base64-encoded. */
function encode(data: Uint8Array): string {
  const CHUNK = 0x8000
  let binary = ''
  for (let i = 0; i < data.length; i += CHUNK) {
    binary += String.fromCharCode(...data.subarray(i, i + CHUNK))
  }
  return btoa(binary)
}

function decode(text: string): Uint8Array {
  const binary = atob(text)
  const data = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) data[i] = binary.charCodeAt(i)
  return data
}

const STORAGE_KEY = 'sfcd-bank-editor:file'

/** `''` stands in for "nothing saved", so a corrupt value just reads as empty. */
const SERIALIZER = {
  read: (raw: string): LoadedFile | null => {
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
      data: decode(stored.data),
    }
  },
  write: (value: LoadedFile | null): string => {
    if (value === null) return ''
    return JSON.stringify({
      name: value.name,
      type: value.type,
      lastModified: value.lastModified,
      data: encode(value.data),
    })
  },
}

export const useBankFileStore = defineStore('bankFile', () => {
  const file = useLocalStorage<LoadedFile | null>(STORAGE_KEY, null, {
    shallow: true,
    deep: false,
    writeDefaults: false,
    listenToStorageChanges: false,
    serializer: SERIALIZER,
  })

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const data = computed<Uint8Array | null>(() => file.value?.data ?? null)
  const byteLength = computed(() => file.value?.data.length ?? 0)
  const isLoaded = computed(() => file.value !== null)

  /** Read the first file in `source` fully into memory. */
  async function load(source: FileSource): Promise<void> {
    const files = toFileArray(source)
    const picked = files[0]

    if (picked === undefined) {
      file.value = null
      error.value = 'No file was provided.'
      return
    }
    if (files.length > 1) {
      error.value = `${files.length} files dropped, only "${picked.name}" was loaded.`
    } else {
      error.value = null
    }

    isLoading.value = true
    try {
      const buffer = await picked.arrayBuffer()
      file.value = {
        name: picked.name,
        type: picked.type,
        lastModified: picked.lastModified,
        data: new Uint8Array(buffer),
      }
    } catch (cause) {
      file.value = null
      error.value = `Could not read "${picked.name}": ${describe(cause)}`
    } finally {
      isLoading.value = false
    }
  }

  function clear(): void {
    file.value = null
    error.value = null
    isLoading.value = false
  }

  return { file, data, byteLength, isLoaded, isLoading, error, load, clear }
})
