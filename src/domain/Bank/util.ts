export function readU32be(data: Uint8Array, offset: number): number | null {
  if (offset < 0 || offset + 4 > data.length) return null
  return (
    ((data[offset + 0]! << 24) |
      (data[offset + 1]! << 16) |
      (data[offset + 2]! << 8) |
      data[offset + 3]!) >>>
    0
  )
}

export function readU16be(data: Uint8Array, offset: number): number {
  return ((data[offset]! << 8) | data[offset + 1]!) >>> 0
}
