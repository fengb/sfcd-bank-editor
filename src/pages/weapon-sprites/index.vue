<script setup lang="ts">
import { chunk } from 'es-toolkit'
import { QTable, QBtnToggle, type QTableProps } from 'quasar'
import { computed, ref, watch } from 'vue'

import TileBlock from '@/components/TileBlock'
import type { Palette } from '@/domain/Bank/BattleSprites/graphics'
import type { WeaponSprite } from '@/domain/Bank/WeaponSprites/decode'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const weaponSprites = computed(() => store.bank!.toc.weaponSprites.region())

const selected = ref<number>(0)
const selectedFrame = ref<number>(0)
const active = computed<WeaponSprite | null>(
  () => weaponSprites.value.sprites[selected.value] ?? null,
)

const palette = computed<Palette>(() => {
  const colors: [number, number, number][] = Array.from({ length: 16 }, () => [0, 0, 0])
  colors[1] = [255, 255, 255]
  colors[2] = [0, 0, 0]
  colors[14] = [192, 192, 192]
  colors[15] = [128, 128, 128]
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
