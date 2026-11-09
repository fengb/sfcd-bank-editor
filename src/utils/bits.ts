export function splitBits(value: number, widths: [number, number]): [number, number]
export function splitBits(value: number, widths: [number, number, number]): [number, number, number]
export function splitBits(
  value: number,
  widths: [number, number, number, number],
): [number, number, number, number]
export function splitBits(value: number, widths: number[]): number[] {
  let offset = 0
  // Extract from the least-significant side, then reverse to MSB-first order.
  const reversed: number[] = []
  for (let i = widths.length - 1; i >= 0; i--) {
    const w = widths[i]!
    const mask = (1 << w) - 1
    reversed.push((value >>> offset) & mask)
    offset += w
  }

  return reversed.reverse()
}
