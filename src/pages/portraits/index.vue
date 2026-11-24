<script setup lang="ts">
import { QBtnToggle, QTable, type QTableProps } from 'quasar'
import { computed, ref, watch } from 'vue'

import Tile from '@/components/Tile'
import TileBlock from '@/components/TileBlock/TileBlock.vue'
import type { Tile as TileModel } from '@/domain/Bank/BattleSprites'
import type { Portrait } from '@/domain/Bank/Portraits/Portraits'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const portraits = computed(() => store.bank!.regions.portraits)

const selected = ref(0)
const showBase = ref(true)
const showAnim = ref(false)
const active = computed(() => portraits.value.portraits[selected.value] ?? null)

const columns: QTableProps['columns'] = [
  { name: 'index', label: 'Index', field: 'index' },
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
        <TileBlock
          v-show="showBase"
          :tiles="active.tiles"
          :palette="active.palette"
          :scale="3"
          :layout="[
            '00 01 02 03 04 05',
            '08 09 0A 0B 0C 0D',
            '10 11 12 13 14 15',
            '18 19 1A 1B 1C 1D',
            '20 21 22 23 24 25',
            '28 29 2A 2B 2C 2D',
            '30 31 32 33 34 35',
          ]"
          style="grid-area: 1 / 1"
        />
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
