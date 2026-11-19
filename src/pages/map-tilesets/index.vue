<script setup lang="ts">
import { computed } from 'vue'

import TileBlock from '@/components/TileBlock'
import { MAP_SPRITE_PALETTE } from '@/domain/Bank/MapSprites/decode'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const mapTilesets = computed(() => store.bank!.regions.mapTilesets)
</script>

<template>
  <h2>Map tilesets</h2>
  <p class="text-grey">{{ mapTilesets.tiles.length }} Tiles</p>
  <TileBlock :tiles="mapTilesets.tiles" :width="32" :palette="MAP_SPRITE_PALETTE" :scale="3" />
</template>

<style scoped></style>
