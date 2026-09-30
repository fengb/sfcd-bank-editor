export const DUMMY_SENTINEL = 'DUMMY'

export const LABELS: Record<number, string | undefined> = {
  0x00: 'Map sprite pointer table',
  0x08: 'Map tileset pointer table',
  0x10: 'Portrait pointer table',
  0x18: 'Ally battle sprite table',
  0x20: 'Weapon sprite pointer table',
  0x28: 'Enemy battle sprite table',
  0x30: 'Background pointer table',
  0x38: 'Grounds graphics',
  0x40: 'Spell graphics pointer table',
  0x48: undefined,
  0x50: undefined,
  0x58: undefined,
  0x60: undefined,
  0x68: 'Textbank block',
  0x70: 'Icon graphics',
  0x78: 'Church / shop HQ graphics',
  0x80: 'Per-map data',
  0x88: 'Battle data',
  0x90: 'Shared WRAM pointer table',
  0x98: 'Pointer table into 0xA0',
  0xa0: undefined,
  0xa8: 'Chapter screen graphics',
}

export function readU32be(data: Uint8Array, offset: number): number | null {
  if (offset < 0 || offset + 4 > data.length) return null
  return (
    (data[offset + 0]! << 24) |
    (data[offset + 1]! << 16) |
    (data[offset + 2]! << 8) |
    (data[offset + 3]! << 0)
  )
}

/** Unused banks are 5-byte stubs reading "DUMMY"; they carry no directory. */
export function isDummyBank(data: Uint8Array): boolean {
  return String.fromCharCode(...data.subarray(0, DUMMY_SENTINEL.length)) === DUMMY_SENTINEL
}
