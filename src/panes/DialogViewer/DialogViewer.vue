<script setup lang="ts">
import { QTable, type QTableProps } from 'quasar'
import { computed } from 'vue'

import type Dialog from '@/domain/Bank/Dialog'

const props = defineProps<{ dialog: Dialog }>()

const rows = computed(() => props.dialog.strings.map((dialog, index) => ({ index, dialog })))

const columns: QTableProps['columns'] = [
  {
    name: 'index',
    label: 'Index',
    field: 'index',
    sortable: true,
  },
  {
    name: 'dialog',
    label: 'Dialog',
    field: 'dialog',
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
        <h3>Dialog strings</h3>
      </div>
    </template>
  </QTable>
</template>

<style scoped></style>
