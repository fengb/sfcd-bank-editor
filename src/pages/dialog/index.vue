<script setup lang="ts">
import { QTable, type QTableProps } from 'quasar'
import { computed } from 'vue'

import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const dialog = computed(() => store.bank!.toc.dialog.region())

const rows = computed(() => dialog.value.strings.map((d, index) => ({ index, dialog: d })))

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
  >
    <template #top>
      <div class="row full-width justify-between items-center">
        <h3>Dialog strings</h3>
      </div>
    </template>
  </QTable>
</template>

<style scoped></style>
