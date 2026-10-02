<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { QInput, QTable, type QTableProps } from 'quasar'

import { BYTES_PER_ROW, formatHex, parseHexOffset, toPrintable } from './hex'

const props = defineProps<{ data: Uint8Array }>()

const rows = computed(() =>
  Array.from({ length: Math.ceil(props.data.length / BYTES_PER_ROW) }, (_, i) => {
    const offset = i * BYTES_PER_ROW
    return { offset, bytes: props.data.subarray(offset, offset + BYTES_PER_ROW) }
  }),
)

const table = ref<QTable | null>(null)
const offsetInput = ref('')

// Only rows near the viewport are ever mounted. Each item is a plain offset,
// so the hex and ASCII cells are formatted in the template below and a row
// costs nothing until it has been scrolled into view.
function goTo(): void {
  if (props.data.length === 0) return

  const offset = parseHexOffset(offsetInput.value, props.data.length - 1)
  // Unparseable input is left alone rather than silently jumping somewhere else.
  if (offset === null) return

  table.value?.scrollTo(Math.floor(offset / BYTES_PER_ROW))
}

// A newly loaded file starts at the top again. The component is not remounted
// between files, so the scroll position would otherwise carry over.
watch(
  () => props.data,
  () => {
    table.value?.scrollTo(0)
  },
)

const columns: QTableProps['columns'] = [
  {
    name: 'offset',
    label: 'Offset',
    field: 'offset',
    format: (offset) => formatHex(offset, 6),
  },
  {
    name: 'hexes',
    label: 'Hexes',
    field: 'bytes',
    format: (bytes: Uint8Array) => [...bytes].map((b) => formatHex(b, 2)).join(' '),
  },
  {
    name: 'ascii',
    label: 'ASCII',
    field: 'bytes',
    format: (bytes: Uint8Array) => [...bytes].map(toPrintable).join(''),
  },
]
</script>

<template>
  <QTable
    ref="table"
    :rows="rows"
    :columns="columns"
    :rows-per-page-options="[0]"
    row-key="offset"
    dense
    hide-bottom
    virtual-scroll
    style="height: 600px"
  >
    <template #top>
      <div class="row full-width justify-between items-center">
        <h3>Contents</h3>

        <form class="viewer__goto" @submit.prevent="goTo">
          <QInput
            v-model="offsetInput"
            class="viewer__goto-input"
            label="Go to"
            dense
            outlined
            placeholder="000000"
            autocomplete="off"
            spellcheck="false"
          />
        </form>
      </div>
    </template>
  </QTable>
</template>

<style scoped>
.viewer__goto-input {
  width: 12ch;
}
</style>
