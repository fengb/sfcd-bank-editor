<script setup lang="ts">
import { computed } from 'vue'

import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const tilesets = computed(() => store.bank!.toc.map2Tilesets.region())
</script>

<template>
  <BytesViewer :bytes="tilesets" title="Unknown 0x98" />
</template>
