<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { QBanner, QBtn, QCard, QCardSection, QFile } from 'quasar'

import GlobalFileDrop, { type DropHandler } from '@/components/GlobalFileDrop.vue'
import { useBankFileStore } from '@/stores/bankFile'
import { formatBytes, formatHexAddress } from '@/utils/format'
import BytesViewer from '@/panes/BytesViewer'
import HeaderViewer from '@/panes/HeaderViewer'

const store = useBankFileStore()
const { file, data, isLoading, error } = storeToRefs(store)

const picked = ref<File | undefined>()

const dropHandler: DropHandler = async (file: File) => {
  await store.load(file)
  return true
}

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
  <GlobalFileDrop :drop-handler="dropHandler" />
  <main class="app">
    <header>
      <h1>SFCD Bank Editor</h1>
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
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stats__value {
  margin: 0.15rem 0 0;
  font-size: 0.85rem;
  overflow-wrap: anywhere;
}
</style>
