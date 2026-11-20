<script setup lang="ts">
import { chunk } from 'es-toolkit'
import { QTable, QBtnToggle, type QTableProps } from 'quasar'
import { computed, ref, watch } from 'vue'

import TileBlock from '@/components/TileBlock'
import type { Color, Palette } from '@/domain/Bank/BattleSprites/graphics'
import type { WeaponSprite } from '@/domain/Bank/WeaponSprites/WeaponSprites'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const weaponSprites = computed(() => store.bank!.regions.weaponSprites)

const selected = ref<number>(0)
const selectedFrame = ref<number>(0)
const active = computed<WeaponSprite | null>(
  () => weaponSprites.value.sprites[selected.value] ?? null,
)

const palette = computed<Palette>(() => {
  const colors: Color[] = Array.from({ length: 16 }, () => [0, 0, 0])
  colors[1] = [7, 7, 7]
  colors[2] = [0, 0, 0]
  colors[14] = [6, 6, 6]
  colors[15] = [3, 3, 3]
  return colors as Palette
})

const columns: QTableProps['columns'] = [
  { name: 'index', label: 'Index', field: 'index' },
  { name: 'frames', label: 'Frames', field: (row: WeaponSprite) => row.frames.length },
]

const frameOptions = computed(() =>
  (active.value?.frames ?? []).map((_, i) => ({ label: String(i), value: i })),
)

watch(weaponSprites, () => {
  selected.value = 0
  selectedFrame.value = 0
})

watch(active, () => {
  selectedFrame.value = 0
})

const tileGroups = computed(() => {
  const tiles = active.value?.frames?.[selectedFrame.value]
  if (!tiles) return null

  return chunk(tiles, 16)
})
</script>

<template>
  <h2>Weapon sprites</h2>
  <div class="row q-gutter-md">
    <QTable
      :rows="weaponSprites.sprites"
      :columns="columns"
      :rows-per-page-options="[0]"
      class="col"
      row-key="index"
      dense
      hide-bottom
      @row-click="(_, row) => (selected = row.index)"
    />
    <div class="col-auto">
      <div v-if="active">
        <div class="row items-center q-gutter-sm">
          <div>Frame</div>
          <QBtnToggle
            v-model="selectedFrame"
            :options="frameOptions"
            dense
            toggle-color="primary"
          />
        </div>
        <div class="grid grid-flow-col grid-rows-2">
          <TileBlock
            v-for="(tiles, i) in tileGroups"
            :key="i"
            :tiles="tiles"
            :palette="palette"
            :scale="3"
            flow="columns"
            :height="4"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
