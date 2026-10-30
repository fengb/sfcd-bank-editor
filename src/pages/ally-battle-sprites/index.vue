<script setup lang="ts">
import { computed } from 'vue'

import BattleSpritesViewer from '@/panes/BattleSpritesViewer'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const battleSprites = computed(() => store.bank!.toc.allyBattleSprites.region())
</script>

<template>
  <BattleSpritesViewer :battleSprites="battleSprites" />
</template>
