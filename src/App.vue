<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDropZone } from '@vueuse/core'
import { QBanner, QBtn, QCard, QCardSection, QFile } from 'quasar'

import AppOverlay from '@/components/AppOverlay.vue'
import { useBankFileStore } from '@/stores/bankFile'
import { formatBytes, formatHexAddress } from '@/utils/format'
import BytesViewer from '@/panes/BytesViewer'
import HeaderViewer from '@/panes/HeaderViewer'

const store = useBankFileStore()
const { file, data, isLoading, error } = storeToRefs(store)

const picked = ref<File | undefined>()

const { isOverDropZone } = useDropZone(document, {
  // Filter on `kind`, not `type` — a binary file's MIME type is often the empty
  // string, so `dataTypes: ['Files']` would reject exactly the files we want.
  // This also stops text drags from lightening up the overlay.
  checkValidity: (items) => Array.from(items).some((item) => item.kind === 'file'),
  multiple: false,
  onDrop: (files) => {
    picked.value = files?.[0]
    void store.load(picked.value)
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

/**
 * QFile is single-select unless `multiple` is set, so it hands over one File.
 * It empties its own <input> right after, so re-picking the same file still
 * fires, and it never reaches for a URL — there is nothing to configure.
 */
function onSelect(selected: File | undefined): void {
  void store.load(selected)
}

function close(): void {
  picked.value = undefined
  store.clear()
}
</script>

<template>
  <main class="app">
    <header>
      <h1>SFCD Bank Editor</h1>
      <p>
        Drop a file anywhere on this window, or pick one. It is read into a
        <code>Uint8Array</code> and kept in memory.
      </p>
    </header>

    <div class="row">
      <QFile v-model="picked" label="Open file…" outlined @update:model-value="onSelect" />
      <QBtn v-if="data" label="Close" flat no-caps @click="close" />
    </div>

    <QBanner v-if="error" dense>
      {{ error }}
    </QBanner>

    <QBanner v-if="isLoading" dense> Reading file… </QBanner>

    <QCard v-if="data" flat bordered>
      <QCardSection>
        <dl class="stats">
          <div v-for="stat in stats" :key="stat.label" class="stats__item">
            <dt class="stats__label">{{ stat.label }}</dt>
            <dd class="stats__value">{{ stat.value }}</dd>
          </div>
        </dl>
      </QCardSection>
    </QCard>

    <HeaderViewer v-if="data" :data="data" />
    <BytesViewer v-if="data" :data="data" />

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
  color: var(--app-text-muted);
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
