<script setup lang="ts">
import { computed } from 'vue'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Message from 'primevue/message'

import { formatHex } from '../BytesViewer/hex'
import { LABELS, isDummyBank, readU32be } from './util'
import { Panel } from 'primevue'

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
</script>

<template>
  <Panel header="Header">
    <Message v-if="isDummy" severity="warn" :closable="false">
      This file is a 5-byte <code>DUMMY</code> placeholder. The bank number is not in use, so there
      is no block directory to read.
    </Message>

    <DataTable v-else :value="entries" size="small" :rowHover="true" scrollable scrollHeight="40vh">
      <Column field="offset" header="Offset">
        <template #body="{ data }">{{ formatHex(data.offset) }}</template>
      </Column>
      <Column field="name" header="Name" />
      <Column field="address" header="Raw address">
        <template #body="{ data }">{{ formatHex(data.address, 6) }}</template>
      </Column>
      <Column field="extent" header="Extent">
        <template #body="{ data }">{{ formatHex(data.extent, 6) }}</template>
      </Column>
    </DataTable>
  </Panel>
</template>

<style scoped></style>
