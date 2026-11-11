<script setup lang="ts">
import { QBtnToggle, QTable, type QTableProps } from 'quasar'
import { computed, ref } from 'vue'

import BytesViewer from '@/components/BytesViewer'
import { formatHex } from '@/components/BytesViewer/hex'
import type { BattleDataRegions, BattleSpriteSet } from '@/domain/Bank/BattleData/decode'
import type Compendium from '@/domain/Bank/Compendium'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const battleData = computed<BattleDataRegions>(() => store.bank!.toc.battleData.region())
const compendium = computed<Compendium>(() => store.bank!.toc.compendium.region())

const selected = ref<'main' | 'bis'>('main')
const activeSet = computed<BattleSpriteSet>(() => {
  return selected.value === 'main' ? battleData.value.spriteset : battleData.value.spritesetBis
})

const allyColumns: QTableProps['columns'] = [
  {
    name: 'index',
    label: 'Index',
    field: 'index',
    align: 'left',
    format: (val) => `${formatHex(val, 2)} - ${compendium.value.names.characters[val]}`,
  },
  { name: 'x', label: 'X', field: 'x' },
  { name: 'y', label: 'Y', field: 'y' },
]

const enemyColumns: QTableProps['columns'] = [
  {
    name: 'index',
    label: 'Index',
    field: 'index',
    align: 'left',
    format: (val) => `${formatHex(val, 2)} - ${compendium.value.names.monsters[val]}`,
  },
  { name: 'x', label: 'X', field: 'x' },
  { name: 'y', label: 'Y', field: 'y' },
  { name: 'ai', label: 'AI', field: 'ai' },
  { name: 'item', label: 'Item', field: 'item' },
  { name: 'moveOrder', label: 'Move order', field: 'moveOrder' },
  { name: 'triggerRegion', label: 'Trigger region', field: 'triggerRegion' },
  { name: 'byte8', label: 'Byte 8', field: 'byte8' },
  { name: 'byte9', label: 'Byte 9', field: 'byte9' },
  { name: 'byte10', label: 'Byte 10', field: 'byte10' },
  { name: 'spawnParams', label: 'Spawn params', field: 'spawnParams' },
]

const aiRegionColumns: QTableProps['columns'] = [
  { name: 'type', label: 'Type', field: 'type' },
  { name: 'x1', label: 'X1', field: 'x1' },
  { name: 'y1', label: 'Y1', field: 'y1' },
  { name: 'x2', label: 'X2', field: 'x2' },
  { name: 'y2', label: 'Y2', field: 'y2' },
  { name: 'x3', label: 'X3', field: 'x3' },
  { name: 'y3', label: 'Y3', field: 'y3' },
  { name: 'x4', label: 'X4', field: 'x4' },
  { name: 'y4', label: 'Y4', field: 'y4' },
]

const aiPointColumns: QTableProps['columns'] = [
  { name: 'x', label: 'X', field: 'x' },
  { name: 'y', label: 'Y', field: 'y' },
]
</script>

<template>
  <h2>Battle data</h2>

  <h3>Pointers</h3>
  <ul>
    <li>Terrain: {{ battleData.terrainPointer }}</li>
    <li>Spriteset: {{ battleData.spritesetPointer }}</li>
    <li>Spriteset (bis): {{ battleData.spritesetBisPointer }}</li>
  </ul>

  <BytesViewer :bytes="battleData.terrain" title="Terrain (raw)" />

  <div class="row items-center q-gutter-md q-mb-md">
    <strong>Spriteset view:</strong>
    <QBtnToggle
      v-model="selected"
      :options="[
        { label: 'Main', value: 'main' },
        { label: 'Bis', value: 'bis' },
      ]"
      toggle-color="primary"
      dense
    />
  </div>

  <div v-if="activeSet">
    <h4>Allies ({{ activeSet.allies.length }})</h4>
    <QTable
      :rows="activeSet.allies"
      :columns="allyColumns"
      :rows-per-page-options="[0]"
      row-key="index"
      dense
      hide-bottom
    />

    <h4>Enemies ({{ activeSet.enemies.length }})</h4>
    <QTable
      :rows="activeSet.enemies"
      :columns="enemyColumns"
      :rows-per-page-options="[0]"
      row-key="index"
      dense
      hide-bottom
    />

    <h4>AI regions ({{ activeSet.aiRegions.length }})</h4>
    <QTable
      :rows="activeSet.aiRegions"
      :columns="aiRegionColumns"
      :rows-per-page-options="[0]"
      dense
      hide-bottom
    />

    <h4>AI points ({{ activeSet.aiPoints.length }})</h4>
    <QTable
      :rows="activeSet.aiPoints"
      :columns="aiPointColumns"
      :rows-per-page-options="[0]"
      dense
      hide-bottom
    />
  </div>

  <BytesViewer :bytes="battleData.bytes" title="Battle data (raw)" />
</template>

<style scoped>
.terrain-grid {
  border-collapse: collapse;
  font-family: monospace;
  font-size: 11px;
}
.terrain-grid td {
  border: 1px solid #444;
  padding: 2px 4px;
  text-align: center;
}
</style>
