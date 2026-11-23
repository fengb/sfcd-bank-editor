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
  <TileBlock :tiles="mapTilesets.tiles" :width="32" :palette="MAP_SPRITE_PALETTE" :scale="3" />
</template>

<style scoped>
button.active {
  font-weight: bold;
}
</style>
