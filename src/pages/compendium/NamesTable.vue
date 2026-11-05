<script setup lang="ts">
import { zip } from 'es-toolkit'
import { QTable, type QTableProps } from 'quasar'
import { capitalize, computed } from 'vue'

import { formatHex } from '@/components/BytesViewer/hex'
import type { CompendiumNames } from '@/domain/Bank/Compendium'

const props = defineProps<{ names: CompendiumNames }>()

const columns = computed<QTableProps['columns']>(() => [
  { name: 'num', label: '#', field: 'num', format: (val) => formatHex(val, 2) },
  ...Object.keys(props.names).map((name, i) => ({
    name,
    label: capitalize(name),
    field: String(i),
    align: 'left' as const,
  })),
])

const rows = computed(() => {
  return zip(...Object.values(props.names)).map((row, num) => Object.assign(row, { num }))
})
</script>

<template>
  <div>
    <QTable
      :rows="rows"
      :columns="columns"
      :rows-per-page-options="[0]"
      row-key="num"
      dense
      hide-bottom
    />
  </div>
</template>

<style scoped></style>
