<script setup lang="ts">
import { computed } from 'vue'

import TileBlock from '@/components/TileBlock'
import { MAP_SPRITE_PALETTE } from '@/domain/Bank/MapSprites/decode'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const mapTilesets = computed(() => store.bank!.toc.mapTilesets.region())
</script>

<template>
  <h2>Map tilesets</h2>
  <p class="text-grey">{{ mapTilesets.count }} tilesets (128 tiles each)</p>
  <div v-for="(tileset, i) in mapTilesets.tilesets" :key="i" class="q-mb-md">
    <h3>Tileset {{ i }}</h3>
    <TileBlock :tiles="tileset" :width="32" :palette="MAP_SPRITE_PALETTE" :scale="3" />
  </div>
</template>

<style scoped></style>
