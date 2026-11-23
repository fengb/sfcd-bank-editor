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
      flow="columns"
      :height="4"
    />
  </div>
</template>

<style scoped></style>
