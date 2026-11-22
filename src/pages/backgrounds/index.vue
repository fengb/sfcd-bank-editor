<script setup lang="ts">
import { chunk } from 'es-toolkit'
import { QTable, type QTableProps } from 'quasar'
import { computed, ref, watch } from 'vue'

import TileBlock from '@/components/TileBlock'
import type { Background } from '@/domain/Bank/Backgrounds/Backgrounds'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const backgrounds = computed(() => store.bank!.regions.backgrounds)

const selected = ref<number>(0)
const active = computed<Background | null>(
  () => backgrounds.value.backgrounds[selected.value] ?? null,
)

const columns: QTableProps['columns'] = [
  { name: 'index', label: 'Index', field: 'index' },
  { name: 'tiles', label: 'Tiles', field: (row: Background) => row.tiles.length },
]

watch(backgrounds, () => {
  selected.value = 0
})
</script>

<template>
  <h2>Backgrounds</h2>
  <div class="row q-gutter-md">
    <QTable
      :rows="backgrounds.backgrounds"
      :columns="columns"
      :rows-per-page-options="[0]"
      class="col"
      row-key="index"
      dense
      hide-bottom
      @row-click="(_, row) => (selected = row.index)"
    />
    <div class="col-auto">
      <div v-if="active" class="grid grid-flow-col grid-rows-3">
        <TileBlock
          v-for="(grouped, i) in chunk(active.tiles, 16)"
          :key="i"
          :tiles="grouped"
          flow="columns"
          :height="4"
          :palette="active.palette"
          :scale="2"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
