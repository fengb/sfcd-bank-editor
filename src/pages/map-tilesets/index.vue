<script setup lang="ts">
import { QBtnToggle } from 'quasar'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import TileBlock from '@/components/TileBlock'
import { MAP_SPRITE_PALETTE } from '@/domain/Bank/MapSprites/decode'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const route = useRoute()

const selected = ref(route.query.mapset === 'extra' ? 'extra' : 'base')

const mapTilesets = computed(() =>
  selected.value === 'extra' ? store.bank!.regions.map2Tilesets : store.bank!.regions.mapTilesets,
)

const layout = computed(() => {
  const n = mapTilesets.value.tiles.length
  const cols = 32
  const rows = Math.ceil(n / cols) || 1
  const out: string[] = []
  for (let r = 0; r < rows; r++) {
    const cells: string[] = []
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c
      if (idx < n) cells.push(idx.toString(16).toUpperCase())
    }
    out.push(cells.join(' '))
  }
  return out.join(',')
})
</script>

<template>
  <h2>Map tilesets</h2>
  <QBtnToggle
    v-model="selected"
    :options="[
      { label: 'Base', value: 'base' },
      { label: 'Extra', value: 'extra' },
    ]"
    toggle-color="primary"
    dense
  />
  <p class="text-grey">{{ mapTilesets.tiles.length }} Tiles</p>
  <TileBlock :tiles="mapTilesets.tiles" :layout="layout" :palette="MAP_SPRITE_PALETTE" :scale="3" />
</template>

<style scoped>
button.active {
  font-weight: bold;
}
</style>
