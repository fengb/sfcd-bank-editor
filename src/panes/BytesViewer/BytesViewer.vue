<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Panel from 'primevue/panel'
import VirtualScroller from 'primevue/virtualscroller'

import { BYTES_PER_ROW, formatAsciiCell, formatHexCell, formatOffset, parseHexOffset } from './hex'

/**
 * Fixed row height in px, bound to `--row-height` and consumed as `.row`'s
 * `line-height`. VirtualScroller places every item at `index * itemSize`, so
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

const scroller = ref<InstanceType<typeof VirtualScroller> | null>(null)

// Only rows near the viewport are ever mounted. Each item is a plain offset,
// so the hex and ASCII cells are formatted in the template below and a row
// costs nothing until it has been scrolled into view.
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

  scroller.value?.scrollToIndex(Math.floor(offset / BYTES_PER_ROW))
}

// Every dimension the stylesheet needs, as CSS custom properties. `ch` units
// are used for the columns because the row font is monospace, so one `ch` is
// exactly one character and each column can be sized to its own content —
// which is what keeps the gaps between them uniform. Derived from the same
// constants the row template renders with, so the grid cannot drift out of sync.
const rowStyle = computed(() => ({
  '--row-height': `${ROW_HEIGHT}px`,
}))

// A newly loaded file starts at the top again. The component is not remounted
// between files, so the scroll position would otherwise carry over.
watch(
  () => props.data,
  () => {
    scroller.value?.scrollToIndex(0)
  },
)
</script>

<template>
  <Panel header="Contents">
    <template #icons>
      <form class="viewer__goto" @submit.prevent="goTo">
        <label class="viewer__goto-label" for="bytes-goto">Go to</label>
        <InputText
          id="bytes-goto"
          name="offset"
          class="viewer__goto-input"
          placeholder="000000"
          autocomplete="off"
          spellcheck="false"
        />
      </form>
    </template>

    <VirtualScroller
      ref="scroller"
      :style="rowStyle"
      :items="rowOffsets"
      :itemSize="ROW_HEIGHT"
      :numToleratedItems="OVERSCAN"
      scrollHeight="60vh"
    >
      <template #item="{ item }">
        <div class="row">
          <span>{{ formatOffset(item) }}</span>
          <span>{{ formatHexCell(data, item) }}</span>
          <span>{{ formatAsciiCell(data, item) }}</span>
        </div>
      </template>
    </VirtualScroller>
  </Panel>
</template>

<style scoped>
.viewer__goto {
  display: flex;
  gap: 0.45rem;
  align-items: center;
}

.viewer__goto-input {
  width: 10ch;
  font-family: var(--app-font-mono);
  font-size: 0.8rem;
}

.row {
  display: flex;
  gap: 8ch;
  font-family: var(--app-font-mono);
  font-size: 12.5px;
  line-height: var(--row-height, 20px);
}

.row:hover {
  background: var(--p-content-hover-background);
}
</style>
