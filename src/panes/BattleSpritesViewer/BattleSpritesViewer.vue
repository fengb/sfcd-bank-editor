<script setup lang="ts">
import { chunk } from 'es-toolkit'
import { QTable, QBtnToggle, type QTableProps } from 'quasar'
import { computed, ref, watch } from 'vue'

import { formatHex } from '@/components/BytesViewer/hex'
import Tile from '@/components/Tile'
import BattleSprites from '@/domain/Bank/BattleSprites'
import type { BattleSprite } from '@/domain/Bank/BattleSprites/decode'

const props = defineProps<{ battleSprites: BattleSprites }>()

const selected = ref<number>(0)
const selectedFrame = ref<number>(0)
const selectedPalette = ref<number>(0)

const columns: QTableProps['columns'] = [
  { name: 'index', label: 'Index', field: 'index' },
  { name: 'pointer', label: 'Pointer', field: 'pointer', format: (val) => formatHex(val, 2) },
  { name: 'animSpeed', label: 'Animation Speed', field: 'animSpeed' },
  { name: 'unknown', label: 'Unknown', field: 'unknown', format: (val) => formatHex(val, 2) },
  { name: 'palettes', label: 'Palettes', field: (row) => row.palettes.length },
  { name: 'frames', label: 'Frames', field: (row) => row.frames.length },
]

const activeSprite = computed<BattleSprite | null>(() => {
  if (selected.value == null) return null
  const sprite = props.battleSprites.sprites[selected.value]
  if (!sprite) return null
  return sprite
})

const frameOptions = computed(() =>
  (activeSprite.value?.frames ?? []).map((_, i) => ({ label: String(i), value: i })),
)

const paletteOptions = computed(() =>
  (activeSprite.value?.palettes ?? []).map((_, i) => ({ label: String(i), value: i })),
)

const tileGroups = computed(() => {
  const tiles = activeSprite.value?.frames[selectedFrame.value!]
  if (!tiles) return null

  return chunk(tiles, 16)
})

watch(
  activeSprite,
  () => {
    selectedFrame.value = 0
    selectedPalette.value = 0
  },
  { flush: 'post' },
)

watch(selected, () => {
  selectedFrame.value = 0
  selectedPalette.value = 0
})
</script>

<template>
  <h2>Battle sprites</h2>
  <div class="row q-gutter-md">
    <QTable
      :rows="props.battleSprites.sprites"
      :columns="columns"
      :rows-per-page-options="[0]"
      class="col"
      row-key="index"
      dense
      hide-bottom
      @row-click="(_, row) => (selected = row.index)"
    />
    <div class="col-auto">
      <div class="row justify-between">
        <div>
          <div>Frame</div>
          <QBtnToggle
            v-model="selectedFrame"
            :options="frameOptions"
            dense
            toggle-color="primary"
          />
        </div>
        <div>
          <div>Palette</div>
          <QBtnToggle
            v-model="selectedPalette"
            :options="paletteOptions"
            dense
            toggle-color="primary"
          />
        </div>
      </div>
      <div class="grid grid-flow-col grid-rows-3">
        <div v-for="(tiles, i) in tileGroups" :key="i" class="grid grid-flow-col grid-rows-4">
          <Tile
            v-for="(tile, j) in tiles"
            :key="j"
            :tile="tile"
            :palette="activeSprite?.palettes?.[selectedPalette]!"
            :scale="3"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
