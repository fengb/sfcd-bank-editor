<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { BYTES_PER_ROW, buildHexRows, formatHex } from './hex'

/** 4 KiB per page: 256 rows, small enough to render without lag. */
const PAGE_BYTES = 4096

/** Byte offsets are always shown as 6 hex digits, e.g. `000000`. */
const OFFSET_DIGITS = 6

const props = defineProps<{ data: Uint8Array }>()

const page = ref(0)
const pageCount = computed(() => Math.max(1, Math.ceil(props.data.length / PAGE_BYTES)))
const start = computed(() => page.value * PAGE_BYTES)
const rows = computed(() => buildHexRows(props.data, start.value, PAGE_BYTES, BYTES_PER_ROW))

const rangeLabel = computed(() => {
  const end = Math.min(props.data.length, start.value + PAGE_BYTES)
  if (end <= start.value) return 'empty'
  return `0x${formatHex(start.value, 6)} – 0x${formatHex(end - 1, 6)}`
})

function go(next: number): void {
  page.value = Math.min(Math.max(0, next), pageCount.value - 1)
}

// Column widths in `ch` units. The row font is monospace, so one `ch` is
// exactly one character and every column can be sized to its own content —
// which is what keeps the gaps between them uniform. Derived from the same
// constants the template renders with, so the grid cannot drift out of sync.
const offsetColumnWidth = computed(() => `${OFFSET_DIGITS}ch`)
const hexColumnWidth = computed(() => `${BYTES_PER_ROW * 3 - 1}ch`)

// A newly loaded file starts at the top again.
watch(
  () => props.data,
  () => {
    page.value = 0
  },
)
</script>

<template>
  <section class="viewer">
    <header class="viewer__bar">
      <h2 class="viewer__title">Contents</h2>
      <div class="viewer__pager">
        <span class="viewer__range">{{ rangeLabel }}</span>
        <button type="button" class="btn" :disabled="page === 0" @click="go(0)">&laquo;</button>
        <button type="button" class="btn" :disabled="page === 0" @click="go(page - 1)">
          &lsaquo;
        </button>
        <span class="viewer__page">{{ page + 1 }} / {{ pageCount }}</span>
        <button type="button" class="btn" :disabled="page + 1 >= pageCount" @click="go(page + 1)">
          &rsaquo;
        </button>
        <button
          type="button"
          class="btn"
          :disabled="page + 1 >= pageCount"
          @click="go(pageCount - 1)"
        >
          &raquo;
        </button>
      </div>
    </header>

    <div
      class="viewer__scroll"
      :style="{ '--offset-col': offsetColumnWidth, '--hex-col': hexColumnWidth }"
    >
      <div v-for="row in rows" :key="row.offset" class="row">
        <span class="row__offset">{{ formatHex(row.offset, OFFSET_DIGITS) }}</span>
        <span class="row__hex">{{ row.hex }}</span>
        <span class="row__ascii">{{ row.ascii }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.viewer {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--panel);
  overflow: hidden;
}

.viewer__bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid var(--border);
}

.viewer__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.viewer__pager {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}

.viewer__range,
.viewer__page {
  color: var(--muted);
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}

.viewer__page {
  min-width: 4.5rem;
  text-align: center;
}

.viewer__scroll {
  max-height: 60vh;
  padding: 0.5rem 0;
  overflow: auto;
}

/* offset | hex | ascii — every column is sized to its content in `ch`, so the
   single `column-gap` below is the only gap in the row. */
.row {
  display: grid;
  grid-template-columns: var(--offset-col, 6ch) var(--hex-col, 47ch) minmax(16ch, 1fr);
  column-gap: 8ch;
  padding: 0 0.9rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.78rem;
  line-height: 1.55;
}

.row:hover {
  background: var(--row-hover);
}

.row__offset {
  color: var(--muted);
}

.row__hex {
  color: var(--hex);
  white-space: pre;
  overflow: hidden;
}

.row__ascii {
  color: var(--ascii);
  white-space: pre;
  overflow: hidden;
}
</style>
