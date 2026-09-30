<script setup lang="ts">
import { computed } from 'vue'

import { formatHex } from '../BytesViewer/hex'
import { LABELS, isDummyBank, readU32be } from './util'

const props = defineProps<{ data: Uint8Array }>()
const offsets = computed(() => Array.from({ length: 0x100 / 8 }, (_, i) => i * 8))
const isDummy = computed(() => isDummyBank(props.data))
</script>

<template>
  <section class="header">
    <header class="header__bar">
      <h2 class="header__title">Header</h2>
      <span class="header__meta">
        <template v-if="isDummy">DUMMY bank</template>
      </span>
    </header>

    <p v-if="isDummy" class="header__note">
      This file is a 5-byte <code>DUMMY</code> placeholder. The bank number is not in use, so there
      is no block directory to read.
    </p>

    <div v-else class="header__scroll">
      <table class="header__table">
        <thead>
          <tr>
            <th>Offset</th>
            <th>Name</th>
            <th>Raw address</th>
            <th>Extent</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="offset in offsets" :key="offset">
            <td class="header__num">{{ formatHex(offset) }}</td>
            <td class="header__name">{{ LABELS[offset] }}</td>
            <td class="header__num">{{ formatHex(readU32be(props.data, offset) ?? 0, 6) }}</td>
            <td class="header__num">
              {{
                readU32be(props.data, offset + 4)
                  ? formatHex(readU32be(props.data, offset + 4) ?? 0, 6)
                  : '-'
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.header {
  margin-bottom: 1rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--panel);
  overflow: hidden;
}

.header__bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid var(--border);
}

.header__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.header__meta {
  color: var(--muted);
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}

.header__note {
  margin: 0;
  padding: 1.5rem 0.9rem;
  color: var(--muted);
}

.header__scroll {
  max-height: 40vh;
  overflow: auto;
}

.header__table {
  width: 100%;
  border-collapse: collapse;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.78rem;
}

.header__table th {
  position: sticky;
  top: 0;
  padding: 0.4rem 0.6rem;
  border-bottom: 1px solid var(--border);
  background: var(--panel);
  color: var(--muted);
  font-size: 0.7rem;
  font-weight: 600;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.header__table td {
  padding: 0.2rem 0.6rem;
  border-bottom: 1px solid #1e222b;
  vertical-align: top;
}

.header__table tr:hover td {
  background: var(--row-hover);
}

.header__num {
  white-space: nowrap;
}

.header__name {
  color: var(--text);
}
</style>
