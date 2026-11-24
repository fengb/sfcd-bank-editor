<script setup lang="ts">
import { QTable, QBtnToggle, type QTableProps } from 'quasar'
import { computed, ref, watch } from 'vue'

import { formatHex } from '@/components/BytesViewer/hex'
import TileBlock from '@/components/TileBlock'
import BattleSprites from '@/domain/Bank/BattleSprites'
import type { BattleSprite } from '@/domain/Bank/BattleSprites/BattleSprites'

const props = defineProps<{ battleSprites: BattleSprites }>()

const selected = ref(0)
const selectedFrame = ref(0)
const selectedPalette = ref(0)

const columns: QTableProps['columns'] = [
  { name: 'index', label: 'Index', field: 'index' },
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

const LAYOUTS = {
  short: [
    '00 04 08 0C    30 34 38 3C    60 64 68 6C',
    '01 05 09 0D    31 35 39 3D    61 65 69 6D',
    '02 06 0A 0E    32 36 3A 3E    62 66 6A 6E',
    '03 07 0B 0F    33 37 3B 3F    63 67 6B 6F',

    '10 14 18 1C    40 44 48 4C    70 74 78 7C',
    '11 15 19 1D    41 45 49 4D    71 75 79 7D',
    '12 16 1A 1E    42 46 4A 4E    72 76 7A 7E',
    '13 17 1B 1F    43 47 4B 4F    73 77 7B 7F',

    '20 24 28 2C    50 54 58 5C    80 84 88 8C',
    '21 25 29 2D    51 55 59 5D    81 85 89 8D',
    '22 26 2A 2E    52 56 5A 5E    82 86 8A 8E',
    '23 27 2B 2F    53 57 5B 5F    83 87 8B 8F',
  ],
  long: [
    '00 04 08 0C    30 34 38 3C    60 64 68 6C    90 94 98 9C',
    '01 05 09 0D    31 35 39 3D    61 65 69 6D    91 95 99 9D',
    '02 06 0A 0E    32 36 3A 3E    62 66 6A 6E    92 96 9A 9E',
    '03 07 0B 0F    33 37 3B 3F    63 67 6B 6F    93 97 9B 9F',

    '10 14 18 1C    40 44 48 4C    70 74 78 7C    A0 A4 A8 AC',
    '11 15 19 1D    41 45 49 4D    71 75 79 7D    A1 A5 A9 AD',
    '12 16 1A 1E    42 46 4A 4E    72 76 7A 7E    A2 A6 AA AE',
    '13 17 1B 1F    43 47 4B 4F    73 77 7B 7F    A3 A7 AB AF',

    '20 24 28 2C    50 54 58 5C    80 84 88 8C    B0 B4 B8 BC',
    '21 25 29 2D    51 55 59 5D    81 85 89 8D    B1 B5 B9 BD',
    '22 26 2A 2E    52 56 5A 5E    82 86 8A 8E    B2 B6 BA BE',
    '23 27 2B 2F    53 57 5B 5F    83 87 8B 8F    B3 B7 BB BF',
  ],
}

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
    <div v-if="activeSprite" class="col-auto">
      <div class="row justify-between items-center">
        <div>Frame</div>
        <QBtnToggle v-model="selectedFrame" :options="frameOptions" dense toggle-color="primary" />
      </div>
      <div class="row justify-between items-center">
        <div>Palette</div>
        <QBtnToggle
          v-model="selectedPalette"
          :options="paletteOptions"
          dense
          toggle-color="primary"
        />
      </div>
      <TileBlock
        :tiles="activeSprite.frames[selectedFrame]!"
        :palette="activeSprite.palettes[selectedPalette]!"
        :scale="3"
        :layout="activeSprite.frames[selectedFrame]!.length! > 144 ? LAYOUTS.long : LAYOUTS.short"
      />
    </div>
  </div>
</template>

<style scoped></style>
