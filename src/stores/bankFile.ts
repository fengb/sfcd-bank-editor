import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'

/** Everything we can pull a file out of: a drop handler's result, an `<input>`, or a single file. */
export type FileSource = File | File[] | FileList | null | undefined

export interface LoadedFile {
  name: string
  size: number
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

export const useBankFileStore = defineStore('bankFile', () => {
  // `shallowRef`, not `ref`: a deep reactive proxy would wrap every one of the
  // millions of bytes in a `Uint8Array` and make reads painfully slow.
  const file = shallowRef<LoadedFile | null>(null)
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
        size: picked.size,
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
