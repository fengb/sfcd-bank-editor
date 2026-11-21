import { extractSections } from '../util'
import type Unknown90 from './Unknown90'

export function decode(target: Unknown90, data: Uint8Array): boolean {
  target.bytes = data
  target.book = data[0x1c]!
  target.battle = data[0x1d]!

  const sections = extractSections(data, 0x235200, {
    a: 0x00,
    b: 0x04,
    c: 0x08,
    d: 0x0c,
    e: 0x10,
    f: 0x14,
    g: 0x18,
  })
  const initial = data.subarray(0x1e, sections.a.segmentOffset)
  target.unknown = { 0: initial, ...sections }
  return true
}
