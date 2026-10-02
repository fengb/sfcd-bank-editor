<script setup lang="ts">
import { computed } from 'vue'
import { QBanner, QTable, type QTableProps } from 'quasar'

import { formatHex } from '../BytesViewer/hex'
import { LABELS, isDummyBank, readU32be } from './util'

interface HeaderEntry {
  offset: number
  name: string | undefined
  address: number
  extent: number
}

const props = defineProps<{ data: Uint8Array }>()

const isDummy = computed(() => isDummyBank(props.data))

const entries = computed<HeaderEntry[]>(() =>
  Array.from({ length: 0x100 / 8 }, (_, i) => i * 8).map((_, i) => {
    const offset = i * 8
    return {
      offset,
      name: LABELS[offset],
      address: readU32be(props.data, offset) ?? 0,
      extent: readU32be(props.data, offset + 4) ?? 0,
    }
  }),
)

const columns: QTableProps['columns'] = [
  { name: 'offset', label: 'Offset', field: 'offset', format: (v) => formatHex(v) },
  { name: 'name', label: 'Name', field: 'name', align: 'left' },
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
]
</script>

<template>
  <QTable
    :rows="entries"
    :columns="columns"
    :rows-per-page-options="[0]"
    row-key="offset"
    dense
    hide-bottom
    style="height: 600px"
  >
    <template #top>
      <h3>Header</h3>

      <QBanner v-if="isDummy" dense>
        This file is a 5-byte <code>DUMMY</code> placeholder. The bank number is not in use, so
        there is no block directory to read.
      </QBanner>
    </template>
  </QTable>
</template>

<style scoped></style>
