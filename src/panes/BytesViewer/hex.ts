/** Number of bytes rendered per line in a hex dump. */
export const BYTES_PER_ROW = 16

/** Byte offsets are always shown as this many hex digits, e.g. `000000`. */
export const OFFSET_DIGITS = 6

/** `0x0A` -> `"0A"`. Width grows automatically for values above two digits. */
export function formatHex(value: number, width = 2): string {
  return value.toString(16).toUpperCase().padStart(width, '0')
}

/**
 * Parse a user-typed byte offset. Accepts an optional `0x` prefix and trims
 * surrounding space; hex digits only, since offsets are displayed in hex.
 * Returns null when there is nothing to parse, otherwise clamps into
 * `[0, max]`.
 */
export function parseHexOffset(text: string, max: number): number | null {
  const trimmed = text.trim().replace(/^0[xX]/, '')
  if (!/^[0-9a-fA-F]+$/.test(trimmed)) return null

  const value = Number.parseInt(trimmed, 16)
  if (!Number.isFinite(value)) return null
  return Math.min(Math.max(0, value), max)
}

/** The bytes of the row starting at `offset`. `subarray` clamps at the end of
 *  the buffer, so a short final row simply comes back with fewer bytes. */
function rowBytes(data: Uint8Array, offset: number): number[] {
  return Array.from(data.subarray(offset, offset + BYTES_PER_ROW))
}

function toPrintable(byte: number): string {
  return byte >= 0x20 && byte <= 0x7e ? String.fromCharCode(byte) : '.'
}

/** Left cell: the row's byte offset. */
export function formatOffset(offset: number): string {
  return formatHex(offset, OFFSET_DIGITS)
}

/** Middle cell: this row's bytes as space separated hex. */
export function formatHexCell(data: Uint8Array, offset: number): string {
  return rowBytes(data, offset)
    .map((byte) => formatHex(byte))
    .join(' ')
}

/** Right cell: this row's bytes as printable ASCII, `.` for anything else. */
export function formatAsciiCell(data: Uint8Array, offset: number): string {
  return rowBytes(data, offset).map(toPrintable).join('')
}
