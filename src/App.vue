<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDropZone } from '@vueuse/core'

import AppOverlay from '@/components/AppOverlay.vue'
import { useBankFileStore } from '@/stores/bankFile'
import { formatBytes, formatHexAddress } from '@/utils/format'
import BytesViewer from '@/panes/BytesViewer'
import HeaderViewer from '@/panes/HeaderViewer'

const store = useBankFileStore()
const { file, data, isLoading, error } = storeToRefs(store)

const { isOverDropZone } = useDropZone(document, {
  // Filter on `kind`, not `type` — a binary file's MIME type is often the empty
  // string, so `dataTypes: ['Files']` would reject exactly the files we want.
  // This also stops text drags from lightening up the overlay.
  checkValidity: (items) => Array.from(items).some((item) => item.kind === 'file'),
  multiple: false,
  onDrop: (files) => {
    store.load(files?.[0])
  },
})

const stats = computed(() => {
  const loaded = file.value
  if (loaded === null) return []
  return [
    { label: 'Name', value: loaded.name },
    { label: 'Size', value: `${loaded.data.length.toLocaleString()} bytes (${formatBytes(loaded.data.length)})` },
    { label: 'Size (hex)', value: `0x${formatHexAddress(loaded.data.length)}` },
    { label: 'MIME type', value: loaded.type === '' ? 'unknown' : loaded.type },
    { label: 'Modified', value: new Date(loaded.lastModified).toLocaleString() },
    { label: 'In memory as', value: `Uint8Array(${loaded.data.length})` },
  ]
})

function onPick(event: Event): void {
  const input = event.currentTarget as HTMLInputElement
  void store.load(input.files?.[0])
  // Clear it so picking the same file again still fires a change event.
  input.value = ''
}
</script>

<template>
  <main class="app">
    <header class="app__header">
      <h1 class="app__title">SFCD Bank Editor</h1>
      <p class="app__subtitle">
        Drop a file anywhere on this window, or pick one. It is read into a
        <code>Uint8Array</code> and kept in memory.
      </p>
    </header>

    <div class="toolbar">
      <label class="btn btn--primary">
        Open file…
        <input type="file" class="visually-hidden" @change="onPick" />
      </label>
      <button v-if="data" type="button" class="btn" @click="store.clear()">Close</button>
    </div>

    <p v-if="error" class="notice notice--error">{{ error }}</p>

    <section v-if="data" class="panel">
      <dl class="stats">
        <div v-for="stat in stats" :key="stat.label" class="stats__item">
          <dt class="stats__label">{{ stat.label }}</dt>
          <dd class="stats__value">{{ stat.value }}</dd>
        </div>
      </dl>
    </section>

    <HeaderViewer v-if="data" :data="data" />
    <BytesViewer v-if="data" :data="data" />

    <section v-else-if="!isLoading" class="empty">
      <p class="empty__title">No file loaded</p>
      <p class="empty__hint">Drop a file on the window, or use <em>Open file…</em> above.</p>
    </section>

    <p v-else class="notice">Reading file…</p>

    <AppOverlay :visible="isOverDropZone">
      <p class="drop__title">{{ isLoading ? 'Reading…' : 'Drop it anywhere' }}</p>
      <p class="drop__hint">
        The file is read straight into a <code>Uint8Array</code> in this tab. Nothing is uploaded.
      </p>
    </AppOverlay>
  </main>
</template>

<style scoped>
.app {
  max-width: 60rem;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
}

.app__header {
  margin-bottom: 1.5rem;
}

.app__title {
  margin: 0 0 0.35rem;
  font-size: 1.6rem;
  letter-spacing: -0.01em;
}

.app__subtitle {
  margin: 0;
  color: var(--muted);
}

.toolbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.panel {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--panel);
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 0.75rem 1.5rem;
  margin: 0;
}

.stats__item {
  min-width: 0;
}

.stats__label {
  color: var(--muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stats__value {
  margin: 0.15rem 0 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.85rem;
  overflow-wrap: anywhere;
}

.notice {
  margin: 0 0 1rem;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--muted);
}

.notice--error {
  border-color: var(--danger-border);
  background: var(--danger-bg);
  color: var(--danger);
}

.empty {
  padding: 3rem 1rem;
  border: 1px dashed var(--border);
  border-radius: 10px;
  text-align: center;
}

.empty__title {
  margin: 0 0 0.35rem;
  font-weight: 600;
}

.empty__hint {
  margin: 0;
  color: var(--muted);
}

.drop__title {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--accent);
}

.drop__hint {
  margin: 0;
  color: var(--muted);
}
</style>
