<script setup lang="ts">
import { computed } from 'vue'

import BytesViewer from '@/components/BytesViewer'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const bytes = computed(() => store.bank!.toc.backgrounds.region())
</script>

<template>
  <BytesViewer :bytes="bytes" title="Backgrounds" />
</template>
