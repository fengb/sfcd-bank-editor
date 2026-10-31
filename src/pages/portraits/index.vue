<script setup lang="ts">
import { QTable, type QTableProps } from 'quasar'
import { computed, ref, watch } from 'vue'

import { formatHex } from '@/components/BytesViewer/hex'
import Tile from '@/components/Tile'
import type { Portrait } from '@/domain/Bank/Portraits/decode'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const portraits = computed(() => store.bank!.toc.portraits.region())

const selected = ref<number>(0)
const active = computed<Portrait | null>(() => portraits.value.portraits[selected.value] ?? null)

const portraitColumns: QTableProps['columns'] = [
  { name: 'index', label: 'Index', field: 'index' },
  {
    name: 'pointer',
    label: 'Pointer',
    field: 'pointer',
    format: (val: number) => formatHex(val, 2),
  },
  { name: 'eyes', label: 'Eyes', field: (row: Portrait) => row.eyeTiles.length },
  { name: 'mouths', label: 'Mouths', field: (row: Portrait) => row.mouthTiles.length },
  { name: 'tiles', label: 'Tiles', field: (row: Portrait) => row.tiles.length },
]

const eyeColumns: QTableProps['columns'] = [
  { name: 'index', label: '#', field: 'index' },
  { name: 'x1', label: 'x1', field: (row: { values: number[] }) => row.values[0] },
  { name: 'y1', label: 'y1', field: (row: { values: number[] }) => row.values[1] },
  { name: 'x2', label: 'x2', field: (row: { values: number[] }) => row.values[2] },
  { name: 'y2', label: 'y2', field: (row: { values: number[] }) => row.values[3] },
]

const mouthColumns: QTableProps['columns'] = eyeColumns

const eyeRows = computed(() =>
  (active.value?.eyeTiles ?? []).map((values, index) => ({ index, values })),
)
const mouthRows = computed(() =>
  (active.value?.mouthTiles ?? []).map((values, index) => ({ index, values })),
)

watch(portraits, () => {
  selected.value = 0
})
</script>

<template>
  <h2>Portraits</h2>
  <div class="row q-gutter-md">
    <QTable
      :rows="portraits.portraits"
      :columns="portraitColumns"
      :rows-per-page-options="[0]"
      class="col"
      row-key="index"
      dense
      hide-bottom
      @row-click="(_, row) => (selected = row.index)"
    />
    <div class="col-auto">
      <div v-if="active" class="grid grid-cols-8">
        <Tile
          v-for="(tile, j) in active.tiles"
          :key="j"
          :tile="tile"
          :palette="active.palette"
          :scale="3"
        />
      </div>
      <h3>Eyes</h3>
      <QTable
        :rows="eyeRows"
        :columns="eyeColumns"
        :rows-per-page-options="[0]"
        dense
        hide-bottom
      />
      <h3>Mouths</h3>
      <QTable
        :rows="mouthRows"
        :columns="mouthColumns"
        :rows-per-page-options="[0]"
        dense
        hide-bottom
      />
    </div>
  </div>
</template>

<style scoped></style>
