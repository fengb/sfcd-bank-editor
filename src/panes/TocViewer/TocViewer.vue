<script setup lang="ts">
import { QBanner, QTable, type QTableProps } from 'quasar'
import { computed } from 'vue'

import { formatHex } from '@/components/BytesViewer/hex'
import { Bank, type BankToc } from '@/domain/bank'

import { LABELS } from './util'

const props = defineProps<{ bank: Bank }>()

const rows = computed(() => Object.values(props.bank.toc))

const columns: QTableProps['columns'] = [
  { name: 'offset', label: 'Offset', field: 'offset', format: (v) => formatHex(v) },
  {
    name: 'name',
    label: 'Name',
    align: 'left',
    field: (row: BankToc) => LABELS[row.offset] ?? '',
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
    field: (row: BankToc) => row.slotSize(),
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
