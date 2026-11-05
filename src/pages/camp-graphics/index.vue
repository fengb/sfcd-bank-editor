<script setup lang="ts">
import { QBtnToggle } from 'quasar'
import { computed, ref } from 'vue'

import TileBlock from '@/components/TileBlock'
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
  <div class="row items-center q-gutter-sm">
    <div>Palette</div>
    <QBtnToggle v-model="selected" :options="paletteOptions" dense toggle-color="primary" />
  </div>
  <div v-if="selectedPalette">
    <TileBlock
      v-for="(tileset, i) in camp.tilesets"
      :key="i"
      :tiles="tileset"
      :width="16"
      :palette="selectedPalette"
      :scale="3"
    />
  </div>
</template>

<style scoped></style>
