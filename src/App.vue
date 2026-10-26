<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { QBanner, QBtn, QCard, QCardSection, QFile } from 'quasar'
import { computed, ref } from 'vue'

import BytesViewer from '@/components/BytesViewer'
import GlobalFileDrop, { type DropHandler } from '@/components/GlobalFileDrop.vue'
import CompendiumViewer from '@/panes/CompendiumViewer'
import DialogViewer from '@/panes/DialogViewer'
import TocViewer from '@/panes/TocViewer'
import { useBankFileStore } from '@/stores/bank'
import { formatHexAddress } from '@/utils/format'

import CharacterViewer from './panes/CharacterViewer'

const store = useBankFileStore()
const { file, bank, isLoading, error } = storeToRefs(store)

const picked = ref<File>()

const dropHandler: DropHandler = async (file: File) => {
  await store.load(file)
  return true
}

const stats = computed(() => {
  const loaded = file.value
  if (loaded === null) return []
  return [
    { label: 'Name', value: loaded.name },
    { label: 'Size (hex)', value: `0x${formatHexAddress(loaded.bytes.length)}` },
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
      <QBtn v-if="bank" label="Close" flat no-caps @click="close" />
    </div>

    <QBanner v-if="error" dense>
      {{ error }}
    </QBanner>

    <QBanner v-if="isLoading" dense> Reading file… </QBanner>

    <div v-if="bank">
      <QCard flat bordered>
        <QCardSection>
          <dl class="stats">
            <div v-for="stat in stats" :key="stat.label" class="stats__item">
              <dt class="stats__label">{{ stat.label }}</dt>
              <dd class="stats__value">{{ stat.value }}</dd>
            </div>
          </dl>
        </QCardSection>
      </QCard>

      <TocViewer :bank="bank" />
      <CharacterViewer :region="bank.toc.characterData.region()" />
      <BytesViewer title="Contents" :bytes="bank.bytes" />
      <CompendiumViewer :region="bank.toc.compendium.region()" />
      <DialogViewer :region="bank.toc.dialog.region()" />
    </div>
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
