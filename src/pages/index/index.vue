<script setup lang="ts">
import { QTable, type QTableProps } from 'quasar'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { formatHex } from '@/components/BytesViewer/hex'
import { type BankToc } from '@/domain/Bank'
import { useBankFileStore } from '@/stores/bank'

import { PAGES } from './util'

const store = useBankFileStore()
const decoder = computed(() => store.bank!.decoder!)
const unknown50 = computed(() => store.bank!.regions.unknown90!)

const rows = computed(() => Object.values(decoder.value.toc))

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
    name: 'size',
    label: 'Size',
    field: 'size',
    format: (v) => formatHex(v, 6),
  },
]
</script>

<template>
  <h3>Summary</h3>
  <dl>
    <dt>Book</dt>
    <dd>{{ unknown50.book }}</dd>
    <dt>Battle</dt>
    <dd>{{ unknown50.battle }}</dd>
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
  </QTable>
</template>
