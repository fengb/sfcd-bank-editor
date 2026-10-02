<script setup lang="ts">
import { useDropZone } from '@vueuse/core'
import { QBanner } from 'quasar'
import { provide, ref, readonly } from 'vue'

export type DropHandler = (file: File) => Promise<boolean>

const props = defineProps<{ dropHandler: DropHandler }>()

const isDragging = ref(false)
const isLoading = ref(false)
const dropHandlers = new Set<DropHandler>([props.dropHandler])

const providerKey = Symbol('GlobalFileDrop')
provide(providerKey, {
  isDragging: readonly(isDragging), // prevent children mutating parent state
  registerHandler: (fn: DropHandler) => dropHandlers.add(fn) && (() => dropHandlers.delete(fn)),
})

const { isOverDropZone } = useDropZone(document, {
  checkValidity: (items) => Array.from(items).some((item) => item.kind === 'file'),
  multiple: false,
  onDrop: async (files) => {
    const file = files?.[0]
    if (!file) return

    isLoading.value = true
    try {
      for (const handler of dropHandlers) {
        const status = await handler(file)
        if (status) return
      }
    } finally {
      isLoading.value = false
    }
  },
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isOverDropZone" class="overlay">
      <QBanner rounded class="bg-primary">
        <h4>Drop it anywhere</h4>
        <p>The file is read straight into a <code>Uint8Array</code> in this tab.</p>
      </QBanner>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 80%);
  backdrop-filter: blur(2px);
  pointer-events: none;
}
</style>
