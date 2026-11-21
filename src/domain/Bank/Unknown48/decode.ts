import { extractEntries, extractSections } from '../util'
import type Unknown48 from './Unknown48'

export function decode(target: Unknown48, data: Uint8Array): boolean {
  const sections = extractSections(data, 0x238600, {
    a: 0x00,
    b: 0x04,
  })
  
  const entries = extractEntries(sections.b, 0x238600 + sections.b.segmentOffset)

  target.bytes = data
  target.unknown = { sections, entries }
  return true
}
