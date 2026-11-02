<script setup lang="ts">
import { QBanner, QTable, type QTableProps } from 'quasar'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { formatHex } from '@/components/BytesViewer/hex'
import { type BankToc } from '@/domain/Bank'
import { useBankFileStore } from '@/stores/bank'

import { PAGES } from './util'

const store = useBankFileStore()
const bank = computed(() => store.bank!)

const rows = computed(() => Object.values(bank.value.toc))

const router = useRouter()

function onRowClick(_evt: Event, row: BankToc): void {
  const page = PAGES.find((p) => p.offset === row.entryOffset)
  if (page) router.push(page.path)
}

const columns: QTableProps['columns'] = [
  { name: 'entryOffset', label: 'Offset', field: 'entryOffset', format: (v) => formatHex(v) },
  {
    name: 'name',
    label: 'Name',
    align: 'left',
    field: (row: BankToc) => PAGES.find((p) => p.offset === row.entryOffset)?.name ?? '',
    classes: 'text-primary',
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
    <dd>{{ bank.bytes[0x124] }}</dd>
    <dt>Chapter</dt>
    <dd>{{ bank.bytes[0x125] }}</dd>
  </dl>
  <QTable
    :rows="rows"
    :columns="columns"
    :rows-per-page-options="[0]"
    row-key="entryOffset"
    dense
    hide-bottom
    @row-click="onRowClick"
  >
    <template #top>
      <QBanner v-if="bank.isDummy" dense>
        This file is a 5-byte <code>DUMMY</code> placeholder. The bank number is not in use, so
        there is no block directory to read.
      </QBanner>
    </template>
  </QTable>
</template>
