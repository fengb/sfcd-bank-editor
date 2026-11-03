<script setup lang="ts">
import { QBtnToggle, QTable, type QTableProps } from 'quasar'
import { computed, ref, watch } from 'vue'

import { formatHex } from '@/components/BytesViewer/hex'
import Tile from '@/components/Tile'
import type { Tile as TileModel } from '@/domain/Bank/BattleSprites'
import type { Portrait } from '@/domain/Bank/Portraits/decode'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const portraits = computed(() => store.bank!.toc.portraits.region())

const selected = ref(0)
const showAnim = ref(false)
const active = computed(() => portraits.value.portraits[selected.value] ?? null)

const columns: QTableProps['columns'] = [
  { name: 'index', label: 'Index', field: 'index' },
  {
    name: 'pointer',
    label: 'Pointer',
    field: 'pointer',
    format: (val: number) => formatHex(val, 2),
  },
  { name: 'eyes', label: 'Eyes', field: (row: Portrait) => row.eyeTiles.length },
  { name: 'mouths', label: 'Mouths', field: (row: Portrait) => row.mouthTiles.length },
]

const animTiles = computed(() => {
  const result: Record<number, TileModel> = {}

  for (const eye of active.value?.eyeTiles ?? []) {
    result[eye.target] = eye.tile
  }
  for (const mouth of active.value?.mouthTiles ?? []) {
    result[mouth.target] = mouth.tile
  }

  return result
})

watch(columns, () => {
  selected.value = 0
})
</script>

<template>
  <h2>Portraits</h2>
  <div class="row q-gutter-md">
    <QTable
      :rows="portraits.portraits"
      :columns="columns"
      :rows-per-page-options="[0]"
      class="col"
      row-key="index"
      dense
      hide-bottom
      @row-click="(_, row) => (selected = row.index)"
    />
    <div class="col-auto">
      <QBtnToggle
        v-model="showAnim"
        :options="[
          { label: 'Base', value: false },
          { label: 'Anim', value: true },
        ]"
        dense
        toggle-color="primary"
      />
      <div v-if="active" class="grid grid-cols-6">
        <Tile
          v-for="(tile, i) in active.baseTiles"
          :key="i"
          :tile="showAnim ? (animTiles[i] ?? tile) : tile"
          :palette="active.palette"
          :scale="3"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
