<script setup lang="ts">
import { QBtnToggle } from 'quasar'
import { computed, ref } from 'vue'

import TileBlock from '@/components/TileBlock'
import { type Palette } from '@/domain/Bank/BattleSprites'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const hq = computed(() => store.bank!.regions.hqGraphics)

const selected = ref(0)
const paletteOptions = computed(() =>
  hq.value.palettes.map((_, i) => ({ label: String(i), value: i })),
)
const selectedPalette = computed<Palette>(() => hq.value.palettes[selected.value]!)
</script>

<template>
  <h2>HQ graphics</h2>
  <div class="row items-center q-gutter-sm">
    <div>Palette</div>
    <QBtnToggle v-model="selected" :options="paletteOptions" dense toggle-color="primary" />
  </div>
  <TileBlock :tiles="hq.camp" :width="16" :palette="selectedPalette" :scale="3" />
  <TileBlock :tiles="hq.noShop" :width="16" :palette="selectedPalette" :scale="3" />
  <TileBlock :tiles="hq.shop" :width="16" :palette="selectedPalette" :scale="3" />
  <TileBlock :tiles="hq.text" :width="1" :palette="selectedPalette" :scale="3" />
</template>

<style scoped></style>
