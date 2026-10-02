<script setup lang="ts">
import { useDropZone } from '@vueuse/core'
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
    <Transition name="overlay-fade">
      <div v-if="isOverDropZone" class="overlay">
        <div class="overlay__card">
          <p class="drop__title">{{ isLoading ? 'Reading…' : 'Drop it anywhere' }}</p>
          <p class="drop__hint">
            The file is read straight into a <code>Uint8Array</code> in this tab. Nothing is
            uploaded.
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: color-mix(in srgb, var(--app-surface-deep) 82%, transparent);
  backdrop-filter: blur(2px);
  pointer-events: none;
}

.overlay__card {
  padding: 2rem 2.5rem;
  border: 2px dashed var(--q-primary);
  border-radius: var(--app-border-radius);
  background: var(--app-surface-raised);
  text-align: center;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 120ms ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.drop__title {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--q-primary);
}

.drop__hint {
  margin: 0;
  color: var(--app-text-muted);
}
</style>
