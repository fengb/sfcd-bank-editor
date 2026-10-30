<script setup lang="ts">
import { computed } from 'vue'

import BytesViewer from '@/components/BytesViewer'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const bytes = computed(() => store.bank!.bytes)
</script>

<template>
  <BytesViewer title="Contents" :bytes="bytes" />
</template>
