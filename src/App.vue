<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { QBtn, QBtnGroup, QCard, QCardSection, QFile } from 'quasar'
import { computed, ref } from 'vue'

import GlobalFileDrop, { type DropHandler } from '@/components/GlobalFileDrop.vue'
import { LABELS, PAGES } from '@/pages/index/util'
import { useBankFileStore } from '@/stores/bank'
import { formatHexAddress } from '@/utils/format'

const store = useBankFileStore()
const { file, bank } = storeToRefs(store)

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
    { label: 'Size', value: `0x${formatHexAddress(loaded.bytes.length)}` },
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
</script>

<template>
  <GlobalFileDrop :drop-handler="dropHandler" />
  <main class="app">
    <header>
      <h1>SFCD Bank Editor</h1>
      <QBtnGroup>
        <QBtn color="primary" to="/" label="Home" />
        <QBtn
          v-for="[offset, to] in Object.entries(PAGES)"
          color="primary"
          :key="offset"
          :to="to"
          :label="LABELS[Number(offset)] ?? to.replace('/', '')"
        />
      </QBtnGroup>
      <QCard flat bordered>
        <QCardSection class="row q-gutter-md items-center">
          <QFile v-model="picked" label="Open file…" outlined @update:model-value="onSelect" />
          <div v-for="stat in stats" :key="stat.label">
            <strong>{{ stat.label }}:</strong> {{ stat.value }}
          </div>
        </QCardSection>
      </QCard>
    </header>

    <RouterView v-if="bank" />
    <p v-else class="text-grey">Load a bank file to view this page.</p>
  </main>
</template>

<style scoped>
.app {
  max-width: 60rem;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
}
</style>
