<script setup lang="ts">
import { computed, watch } from 'vue'
import { useVirtualList } from '@vueuse/core'

import {
  BYTES_PER_ROW,
  OFFSET_DIGITS,
  formatAsciiCell,
  formatHexCell,
  formatOffset,
  parseHexOffset,
} from './hex'

/**
 * Fixed row height in px, bound to `--row-height` and consumed as `.row`'s
 * `line-height`. useVirtualList places every row at `index * itemHeight`, so
 * the number the scroll maths uses and the number the browser renders have to
 * be the same value — pinned in px rather than rem for exactly that reason, or
 * a user changing their root font-size would silently desync them and rows
 * would overlap or gap while scrolling.
 */
const ROW_HEIGHT = 20

/** Rows kept mounted either side of the viewport so scrolling doesn't flash. */
const OVERSCAN = 8

const props = defineProps<{ data: Uint8Array }>()

const rowOffsets = computed(() =>
  Array.from({ length: Math.ceil(props.data.length / BYTES_PER_ROW) }, (_, i) => i * BYTES_PER_ROW),
)

// Only rows near the viewport are ever mounted. ByteRow slices its own bytes,
// so a row costs nothing until it has been scrolled into view.
const { list, scrollTo, containerProps, wrapperProps } = useVirtualList(rowOffsets, {
  itemHeight: ROW_HEIGHT,
  overscan: OVERSCAN,
})

function goTo(event: SubmitEvent): void {
  if (props.data.length === 0) return

  const form = event.currentTarget
  if (!(form instanceof HTMLFormElement)) return

  // The input's value is read straight off the form that was submitted, so
  // there is no v-model mirroring state that only exists between keypresses.
  const value = new FormData(form).get('offset')
  if (typeof value !== 'string') return

  const offset = parseHexOffset(value, props.data.length - 1)
  // Unparseable input is left alone rather than silently jumping somewhere else.
  if (offset === null) return

  scrollTo(Math.floor(offset / BYTES_PER_ROW))
}

// Every dimension the stylesheet needs, as CSS custom properties. `ch` units
// are used for the columns because the row font is monospace, so one `ch` is
// exactly one character and each column can be sized to its own content —
// which is what keeps the gaps between them uniform. Derived from the same
// constants ByteRow renders with, so the grid cannot drift out of sync.
const rowHeight = computed(() => `${ROW_HEIGHT}px`)
const offsetColumnWidth = computed(() => `${OFFSET_DIGITS}ch`)
const hexColumnWidth = computed(() => `${BYTES_PER_ROW * 3 - 1}ch`)

// A newly loaded file starts at the top again. The component is not remounted
// between files, so the scroll position would otherwise carry over.
watch(
  () => props.data,
  () => {
    scrollTo(0)
  },
)
</script>

<template>
  <section class="viewer">
    <header class="viewer__bar">
      <h2 class="viewer__title">Contents</h2>
      <form class="viewer__goto" @submit.prevent="goTo">
        <label class="viewer__goto-label" for="bytes-goto">Go to</label>
        <input
          id="bytes-goto"
          name="offset"
          class="viewer__goto-input"
          type="text"
          placeholder="000000"
          autocomplete="off"
          spellcheck="false"
        />
      </form>
    </header>

    <div class="viewer__scroll" v-bind="containerProps">
      <div
        class="viewer__rows"
        v-bind="wrapperProps"
        :style="{
          '--row-height': rowHeight,
          '--offset-col': offsetColumnWidth,
          '--hex-col': hexColumnWidth,
        }"
      >
        <div v-for="item in list" :key="item.data" class="row">
          <span class="row__offset">{{ formatOffset(item.data) }}</span>
          <span class="row__hex">{{ formatHexCell(data, item.data) }}</span>
          <span class="row__ascii">{{ formatAsciiCell(data, item.data) }}</span>
        </div>
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

/* A real <form> so Enter submits natively, rather than a keyup handler. */
.viewer__goto {
  display: flex;
  gap: 0.45rem;
  align-items: center;
}

.viewer__goto-label {
  color: var(--muted);
  font-size: 0.8rem;
}

.viewer__goto-input {
  width: 10ch;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg);
  color: var(--text);
  font: inherit;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.8rem;
}

.viewer__goto-input:focus {
  border-color: var(--accent);
  outline: none;
}

/* The height bound is what gives the virtual list a viewport to measure
   against; overflow comes from containerProps. Deliberately no padding here:
   the list places row 0 at offset 0, so a padding-top would shift every row by
   that much and the scroll maths would no longer line up with what is drawn. */
.viewer__scroll {
  max-height: 60vh;
}

/* offset | hex | ascii — every column is sized to its content in `ch`, so the
   single `column-gap` below is the only gap in the row. The column widths and
   `--row-height` are set on `.viewer__rows` and inherited from there. */
.row {
  display: grid;
  grid-template-columns: var(--offset-col, 6ch) var(--hex-col, 47ch) minmax(16ch, 1fr);
  column-gap: 8ch;
  padding: 0 0.9rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  line-height: var(--row-height, 20px);
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
