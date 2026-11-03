<script setup lang="ts">
import { QBtnToggle } from 'quasar'
import { computed, ref } from 'vue'

import Tile from '@/components/Tile'
import { type Palette } from '@/domain/Bank/BattleSprites'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const camp = computed(() => store.bank!.toc.campGraphics.region())

const selected = ref(0)
const paletteOptions = computed(() =>
  camp.value.palettes.map((_, i) => ({ label: String(i), value: i })),
)
const selectedPalette = computed<Palette>(() => camp.value.palettes[selected.value]!)
</script>

<template>
  <h2>Camp graphics</h2>
  <div>Palette</div>
  <QBtnToggle v-model="selected" :options="paletteOptions" dense toggle-color="primary" />
  <div v-if="selectedPalette">
    <div
      v-for="(tileset, i) in camp.tilesets"
      :key="i"
      class="grid grid-cols-16"
      style="width: max-content"
    >
      <Tile
        v-for="(tile, j) in tileset"
        :key="j"
        :tile="tile"
        :palette="selectedPalette"
        :scale="3"
      />
    </div>
  </div>
</template>

<style scoped></style>
