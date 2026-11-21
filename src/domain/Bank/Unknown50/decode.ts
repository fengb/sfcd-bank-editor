import { extractEntries, extractSections } from '../util'
import type Unknown50 from './Unknown50'

export function decode(target: Unknown50, data: Uint8Array): boolean {
  const sections = extractSections(data, 0x236e00, {
    a: 0x00,
    b: 0x04,
  })
  const entriesA = extractEntries(sections.a, 0x236e00 + sections.a.segmentOffset)
  const entriesB = extractEntries(sections.b, 0x236e00 + sections.b.segmentOffset)

  target.bytes = data
  target.unknown = { sections, entriesA, entriesB }
  return true
}
