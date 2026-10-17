<script setup lang="ts">
import { computed } from 'vue'
import { QBanner, QTable, type QTableProps } from 'quasar'

import { formatHex } from '../BytesViewer/hex'
import { LABELS } from './util'
import { Bank, type BankHeader } from '@/domain/bank'

const props = defineProps<{ bank: Bank }>()

const rows = computed(() => Object.values(props.bank.headers))

const columns: QTableProps['columns'] = [
  { name: 'offset', label: 'Offset', field: 'offset', format: (v) => formatHex(v) },
  {
    name: 'name',
    label: 'Name',
    align: 'left',
    field: (row: BankHeader) => LABELS[row.offset] ?? '',
  },
  {
    name: 'address',
    label: 'Raw address',
    field: 'address',
    format: (v) => formatHex(v, 6),
  },
  {
    name: 'extent',
    label: 'Extent',
    field: 'extent',
    format: (v) => formatHex(v, 6),
  },
  {
    name: 'slot-size',
    label: 'Slot Size',
    field: (row: BankHeader) => props.bank.slotSize(row),
  },
]
</script>

<template>
  <h3>Summary</h3>
  <dl>
    <dt>Book</dt>
    <dd>{{ props.bank.bytes[0x124] }}</dd>
    <dt>Chapter</dt>
    <dd>{{ props.bank.bytes[0x125] }}</dd>
  </dl>
  <QTable
    :rows="rows"
    :columns="columns"
    :rows-per-page-options="[0]"
    row-key="offset"
    dense
    hide-bottom
    style="height: 600px"
  >
    <template #top>
      <QBanner v-if="props.bank.isDummy" dense>
        This file is a 5-byte <code>DUMMY</code> placeholder. The bank number is not in use, so
        there is no block directory to read.
      </QBanner>
    </template>
  </QTable>
</template>

<style scoped></style>
