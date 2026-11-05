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
const showBase = ref(true)
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
  const result: (TileModel | undefined)[] = Array.from({
    length: active.value?.baseTiles.length ?? 0,
  })

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
      <div class="row justify-between items-center">
        <strong>Base</strong>
        <QBtnToggle
          v-model="showBase"
          :options="[
            { label: 'Hide', value: false },
            { label: 'Show', value: true },
          ]"
          dense
          toggle-color="primary"
        />
      </div>
      <div class="row justify-between items-center">
        <strong>Anim</strong>
        <QBtnToggle
          v-model="showAnim"
          :options="[
            { label: 'Hide', value: false },
            { label: 'Show', value: true },
          ]"
          dense
          toggle-color="primary"
        />
      </div>
      <div v-if="active" class="grid">
        <div v-show="showBase" class="grid grid-cols-6" style="grid-area: 1 / 1">
          <Tile
            v-for="(tile, i) in active.baseTiles"
            :key="`base-${i}`"
            :tile="tile"
            :palette="active.palette"
            :scale="3"
          />
        </div>
        <div v-show="showAnim" class="grid grid-cols-6" style="grid-area: 1 / 1">
          <template v-for="(tile, i) in animTiles" :key="`anim-${i}`">
            <Tile v-if="tile" :tile="tile" :palette="active.palette" :scale="3" />
            <div v-else style="width: 24px; height: 24px" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
