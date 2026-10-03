<script setup lang="ts">
import { computed } from 'vue'
import { QBanner, QTable, type QTableProps } from 'quasar'

import { formatHex } from '../BytesViewer/hex'
import { LABELS, isDummyBank, readU32be } from './util'

interface HeaderRow {
  offset: number
  name: string | undefined
  address: number
  extent: number
}

const props = defineProps<{ data: Uint8Array }>()

const isDummy = computed(() => isDummyBank(props.data))

const rows = computed<HeaderRow[]>(() =>
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
  {
    name: 'slot-size',
    label: 'Slot Size',
    field: (row: HeaderRow) => {
      // Extent is canonical. Don't derive anything if this exists.
      if (row.extent) {
        return null
      }

      // Distance between first entry and first entry's target
      const target = readU32be(props.data, row.address - 0x10000) ?? 0
      const slotSize = target - row.address

      if (slotSize < 0) {
        // Data is thoroughly messed up -- target is before the metadata
        return 'error'
      } else if (slotSize > 0x1000) {
        // Slot stride is massive -- (probably) not a slot
        return '--'
      }

      return slotSize
    },
  },
]
</script>

<template>
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
      <h3>Header</h3>

      <QBanner v-if="isDummy" dense>
        This file is a 5-byte <code>DUMMY</code> placeholder. The bank number is not in use, so
        there is no block directory to read.
      </QBanner>
    </template>
  </QTable>
</template>

<style scoped></style>
