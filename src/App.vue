<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDropZone } from '@vueuse/core'
import Button from 'primevue/button'
import Card from 'primevue/card'
import FileUpload, { type FileUploadSelectEvent } from 'primevue/fileupload'
import Message from 'primevue/message'
import Toolbar from 'primevue/toolbar'

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
    {
      label: 'Size',
      value: `${loaded.data.length.toLocaleString()} bytes (${formatBytes(loaded.data.length)})`,
    },
    { label: 'Size (hex)', value: `0x${formatHexAddress(loaded.data.length)}` },
    { label: 'MIME type', value: loaded.type === '' ? 'unknown' : loaded.type },
    { label: 'Modified', value: new Date(loaded.lastModified).toLocaleString() },
    { label: 'In memory as', value: `Uint8Array(${loaded.data.length})` },
  ]
})

function onSelect(event: FileUploadSelectEvent): void {
  // `customUpload` keeps FileUpload from ever reaching for a URL; it just hands
  // the picked files over. It also resets its own file input afterwards, so
  // picking the same file again still fires.
  void store.load(event.files?.[0])
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

    <Toolbar class="app__toolbar">
      <template #start>
        <FileUpload
          mode="basic"
          chooseLabel="Open file…"
          :customUpload="true"
          :multiple="false"
          :select="onSelect"
        />
        <Button v-if="data" label="Close" severity="secondary" text @click="store.clear()" />
      </template>
    </Toolbar>

    <Message v-if="error" severity="error" :closable="false" class="app__notice">
      {{ error }}
    </Message>

    <Message v-if="isLoading" severity="info" :closable="false" class="app__notice">
      Reading file…
    </Message>

    <Card v-if="data" class="app__panel">
      <template #content>
        <dl class="stats">
          <div v-for="stat in stats" :key="stat.label" class="stats__item">
            <dt class="stats__label">{{ stat.label }}</dt>
            <dd class="stats__value">{{ stat.value }}</dd>
          </div>
        </dl>
      </template>
    </Card>

    <HeaderViewer v-if="data" :data="data" />
    <BytesViewer v-if="data" :data="data" />

    <Card v-else-if="!isLoading" class="app__empty">
      <template #content>
        <p class="empty__title">No file loaded</p>
        <p class="empty__hint">Drop a file on the window, or use <em>Open file…</em> above.</p>
      </template>
    </Card>

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
  color: var(--p-text-muted-color);
}

.app__toolbar {
  margin-bottom: 1rem;
}

.app__notice {
  display: block;
  margin-bottom: 1rem;
}

.app__panel {
  margin-bottom: 1rem;
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
  color: var(--p-text-muted-color);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stats__value {
  margin: 0.15rem 0 0;
  font-family: var(--app-font-mono);
  font-size: 0.85rem;
  overflow-wrap: anywhere;
}

.app__empty {
  text-align: center;
}

.empty__title {
  margin: 0 0 0.35rem;
  font-weight: 600;
}

.empty__hint {
  margin: 0;
  color: var(--p-text-muted-color);
}

.drop__title {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--p-primary-color);
}

.drop__hint {
  margin: 0;
  color: var(--p-text-muted-color);
}
</style>
