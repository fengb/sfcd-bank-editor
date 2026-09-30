/** Number of bytes rendered per line in a hex dump. */
export const BYTES_PER_ROW = 16

export interface HexRow {
  /** Byte offset of the first cell in the row. */
  offset: number
  bytes: number[]
  /** Space separated, upper case hex, two digits per byte. */
  hex: string
  /** Printable ASCII rendering, `.` for everything else. */
  ascii: string
}

/** `0x0A` -> `"0A"`. Width grows automatically for values above two digits. */
export function formatHex(value: number, width = 2): string {
  return value.toString(16).toUpperCase().padStart(width, '0')
}

/** Read one byte, padding out-of-range reads with 0. */
export function byteAt(data: Uint8Array, index: number): number {
  return data[index] ?? 0
}

function toPrintable(byte: number): string {
  return byte >= 0x20 && byte <= 0x7e ? String.fromCharCode(byte) : '.'
}

/**
 * Build hex dump rows for `[start, start + byteCount)`, clamped to the buffer
 * and snapped to `bytesPerRow` boundaries so rows always line up with the
 * absolute file offset.
 */
export function buildHexRows(
  data: Uint8Array,
  start: number,
  byteCount: number,
  bytesPerRow: number = BYTES_PER_ROW,
): HexRow[] {
  const width = Math.max(1, bytesPerRow)
  const from = Math.max(0, start)
  const to = Math.min(data.length, from + Math.max(0, byteCount))
  const rows: HexRow[] = []

  for (let offset = from; offset < to; offset += width) {
    const bytes: number[] = []
    const rowEnd = Math.min(offset + width, to)
    for (let i = offset; i < rowEnd; i++) {
      bytes.push(byteAt(data, i))
    }
    rows.push({
      offset,
      bytes,
      hex: bytes.map((byte) => formatHex(byte)).join(' '),
      ascii: bytes.map(toPrintable).join(''),
    })
  }

  return rows
}
