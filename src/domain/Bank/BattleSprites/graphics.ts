import { BitReader, ByteReader } from '../util'
export const VALUE_MAP: Record<number, number> = {
  0: 0,
  2: 52,
  4: 87,
  6: 116,
  8: 144,
  10: 172,
  12: 206,
  14: 255,
}

export type Color = [number, number, number]

export type Palette = [
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
]

export type Tile = {
  pixels: number[][]
}

export function parsePalette(data: Uint8Array): Palette {
  const colors: Color[] = []
  for (let i = 0; i + 1 < data.length; i += 2) {
    const first = data[i]!
    const second = data[i + 1]!
    const b = first & 0x0f
    const g = (second & 0xf0) >> 4
    const r = second & 0x0f
    colors.push([VALUE_MAP[r & 0x0e] ?? 0, VALUE_MAP[g & 0x0e] ?? 0, VALUE_MAP[b & 0x0e] ?? 0])
  }
  while (colors.length < 16) {
    colors.push([0, 0, 0])
  }
  return colors.slice(0, 16) as Palette
}

export function convertTiles(data: number[]): Tile[] {
  const tileCount = Math.floor(data.length / 32)
  const tiles: Tile[] = []
  for (let t = 0; t < tileCount; t++) {
    const pixelGrid: number[][] = Array.from({ length: 8 }, () => [])
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x += 2) {
        const currentByte = data[t * 32 + Math.floor((y * 8 + x) / 2)]!
        const firstPixel = (currentByte & 0xf0) >> 4
        const secondPixel = currentByte & 0x0f
        pixelGrid[x]![y] = firstPixel
        pixelGrid[x + 1]![y] = secondPixel
      }
    }
    tiles.push({ pixels: pixelGrid })
  }
  return tiles
}

const VALUE_CODE_TO_INDEX: Record<string, number> = {
  '00': 0,
  '01': 1,
  '100': 2,
  '101': 3,
  '110': 4,
  '11100': 5,
  '11101': 6,
  '11110': 7,
  '1111100': 8,
  '1111101': 9,
  '1111110': 10,
  '111111100': 11,
  '111111101': 12,
  '111111110': 13,
  '1111111110': 14,
  '1111111111': 15,
}

const COMMAND_PATTERNS: Record<string, number[]> = {
  '0': [0, 0, 0, 0],
  '100': [0, 0, 0, 1],
  '101': [0, 0, 1, 0],
  '110': [0, 1, 0, 0],
  '1110': [1, 0, 0, 0],
}

function decodeStackGraphicsLinear(input: Uint8Array): number[] {
  const reader = new BitReader(input)

  const history: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]

  function nextValue(): number {
    const valueIndex = reader.nextPrefixCodeLookup(VALUE_CODE_TO_INDEX)!

    const value = history[valueIndex]!
    if (valueIndex !== 0) {
      history.splice(valueIndex, 1)
      history.unshift(value)
    }
    return value
  }

  function nextWordValue(): number {
    let value = 0
    for (let i = 0; i < 4; i++) {
      value = (value << 4) | nextValue()
    }
    return value
  }

  const output: number[] = []
  while (true) {
    const commands: number[] = []
    for (let i = 0; i < 4; i++) {
      const command = reader.nextPrefixCodeLookup(COMMAND_PATTERNS)
      if (command) {
        commands.push(...command)
      } else {
        commands.push(...reader.nextBits(4))
      }
    }
    for (const command of commands) {
      if (command === 0) {
        const value = nextWordValue()
        output.push((value >> 8) & 0xff, value & 0xff)
      } else {
        const copyOffset = reader.nextBitsValue(11)
        if (copyOffset === 0) {
          return output
        }
        const copyLength = 2 + reader.nextZeroes()
        for (let j = 0; j < copyLength; j++) {
          const idx = output.length - 2 * copyOffset
          output.push(output[idx]!, output[idx + 1]!)
        }
      }
    }
  }
}

export function decodeStackGraphics(input: Uint8Array): Tile[] | null {
  try {
    const linear = decodeStackGraphicsLinear(input)
    return convertTiles(linear)
  } catch {
    return null
  }
}
export function decodeBasicGraphics(input: Uint8Array): Tile[] | null {
  try {
    const reader = new ByteReader(input)
    const output: number[] = []
    let done = false

    while (!done) {
      if (reader.pos + 2 > input.length) break
      const commands = reader.nextBits(16)

      for (const command of commands) {
        if (done) break
        if (command) {
          if (reader.pos + 2 > input.length) {
            done = true
            break
          }
          const repeatCommand = reader.nextU16()
          if (repeatCommand === 0) {
            done = true
            break
          }
          const repeats = 33 - (repeatCommand & 0x1f)
          const wordIndex = repeatCommand >> 5

          // Need at least wordIndex words of prior output to copy from.
          if (output.length < wordIndex * 2) return null

          let copyPointer = output.length - wordIndex * 2
          for (let r = 0; r < repeats; r++) {
            if (copyPointer + 1 >= output.length) return null
            output.push(output[copyPointer]!, output[copyPointer + 1]!)
            if (wordIndex !== 1) copyPointer += 2
          }
        } else {
          if (reader.pos + 2 > input.length) {
            done = true
            break
          }
          output.push(...reader.nextBytes(2))
        }
      }
    }

    return convertTiles(output)
  } catch {
    return null
  }
}
