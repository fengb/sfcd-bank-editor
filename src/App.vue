<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { QBtn, QBtnGroup, QFile, QTooltip } from 'quasar'
import { ref } from 'vue'

import GlobalFileDrop, { type DropHandler } from '@/components/GlobalFileDrop.vue'
import { PAGES } from '@/pages/index/util'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const { file, bank } = storeToRefs(store)

const picked = ref<File>()

const dropHandler: DropHandler = async (file: File) => {
  await store.load(file)
  return true
}

const nav = PAGES.map((page) => ({
  to: page.path,
  label: page.name,
  icon: page.icon,
}))

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
      <div class="row justify-between items-center q-mb-md">
        <h1 class="brand-name">Shining Force CD Bank Editor</h1>
        <QFile
          style="width: 150px"
          v-model="picked"
          :display-value="file?.name"
          :label="file ? 'File' : 'Open File...'"
          filled
          dense
          @update:model-value="onSelect"
        />
      </div>
      <QBtnGroup tag="nav" spread>
        <QBtn
          v-for="item in nav"
          :color="$route.path === item.to ? 'primary' : 'secondary'"
          :key="item.to"
          :to="item.to"
          :aria-label="item.label"
          padding="xs sm"
        >
          {{ item.icon }}
          <QTooltip anchor="top middle" :offset="[27, 27]" transition-show="jump-up">
            {{ item.label }}
          </QTooltip>
        </QBtn>
      </QBtnGroup>
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

.brand-name {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
}
</style>
