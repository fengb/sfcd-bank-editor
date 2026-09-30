/** Human readable byte count, e.g. `64.00 KiB`. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KiB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`
}

/** Upper case, zero padded hex without a `0x` prefix. */
export function formatHexAddress(value: number, width = 4): string {
  return value.toString(16).toUpperCase().padStart(width, '0')
}

/** Big-endian `$$$$` sub-CPU address used by the bank headers. */
export function formatSubCpuAddress(address: number): string {
  return `$${formatHexAddress(address)}`
}
