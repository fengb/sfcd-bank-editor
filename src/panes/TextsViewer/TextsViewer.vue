<script setup lang="ts">
import { computed } from 'vue'
import { QTable, type QTableProps } from 'quasar'

import { parseTextBlock } from './parse'

const props = defineProps<{ bytes: Uint8Array }>()

const strings = computed(() => parseTextBlock(props.bytes))
const rows = computed(() => strings.value.map((text, index) => ({ index, text })))

const columns: QTableProps['columns'] = [
  {
    name: 'index',
    label: 'Index',
    field: 'index',
    sortable: true,
  },
  {
    name: 'text',
    label: 'Text',
    field: 'text',
    align: 'left',
  },
]
</script>

<template>
  <QTable
    :rows="rows"
    :columns="columns"
    :rows-per-page-options="[0]"
    row-key="index"
    dense
    hide-bottom
    style="height: 600px"
  >
    <template #top>
      <div class="row full-width justify-between items-center">
        <h3>Text block strings</h3>
      </div>
    </template>
  </QTable>
</template>

<style scoped></style>
