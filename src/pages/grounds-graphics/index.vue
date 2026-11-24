<script setup lang="ts">
import { computed } from 'vue'

import { formatHex } from '@/components/BytesViewer/hex'
import TileBlock from '@/components/TileBlock'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const grounds = computed(() => store.bank!.regions.grounds)
</script>

<template>
  <h2>Grounds graphics</h2>
  <div v-for="(ground, i) in grounds.entries" :key="i">
    {{ ground.paletteDelta.map((val) => formatHex(val, 2)).join(' ') }}
    <TileBlock
      :key="i"
      :tiles="ground.tiles"
      :palette="store.bank!.regions.backgrounds.backgrounds[0]!.palette"
      layout="00 04 08 0C 10 14 18 1C 20 24 28 2C,01 05 09 0D 11 15 19 1D 21 25 29 2D,02 06 0A 0E 12 16 1A 1E 22 26 2A 2E,03 07 0B 0F 13 17 1B 1F 23 27 2B 2F"
    />
  </div>
</template>

<style scoped></style>
