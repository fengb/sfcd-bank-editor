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

class StackGraphicsReader {
  private readonly data: Uint8Array
  private readonly history: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]

  private currentBit = -1

  constructor(input: Uint8Array) {
    this.data = input
  }

  private nextBit(): number {
    this.currentBit++
    const byte = this.data[this.currentBit >> 3]
    if (byte === undefined) {
      throw new Error('Unexpected end of input')
    }
    return (byte >> (7 - (this.currentBit & 7))) & 1
  }

  private nextPrefixCodeLookup<T>(mapping: Record<string, T>): T | undefined {
    const max = Math.max(...Object.keys(mapping).map((key) => key.length))

    let code = ''
    while (code.length < max) {
      code += this.nextBit()
      if (Object.prototype.hasOwnProperty.call(mapping, code)) {
        return mapping[code]
      }
    }
    return undefined
  }

  nextCommandPattern(): number[] {
    const command = this.nextPrefixCodeLookup(COMMAND_PATTERNS)
    if (command !== undefined) return command

    const custom: number[] = []
    for (let i = 0; i < 4; i++) {
      custom.push(this.nextBit())
    }
    return custom
  }

  private nextValue(): number {
    const valueIndex = this.nextPrefixCodeLookup(VALUE_CODE_TO_INDEX)!

    const value = this.history[valueIndex]!
    if (valueIndex !== 0) {
      this.history.splice(valueIndex, 1)
      this.history.unshift(value)
    }
    return value
  }

  nextWordValue(): number {
    let value = 0
    for (let i = 0; i < 4; i++) {
      value = (value << 4) | this.nextValue()
    }
    return value
  }

  nextCopyOffset(): number {
    let offset = 0
    for (let i = 0; i < 11; i++) {
      offset = (offset << 1) | this.nextBit()
    }
    return offset
  }

  nextCopyLength(): number {
    let length = 2
    while (this.nextBit() === 0) {
      length++
    }
    return length
  }
}

function decodeStackGraphicsLinear(input: Uint8Array): number[] {
  const decoder = new StackGraphicsReader(input)

  const output: number[] = []
  while (true) {
    const commands: number[] = []
    for (let i = 0; i < 4; i++) {
      commands.push(...decoder.nextCommandPattern())
    }
    for (const command of commands) {
      if (command === 0) {
        const value = decoder.nextWordValue()
        output.push((value >> 8) & 0xff, value & 0xff)
      } else {
        const copyOffset = decoder.nextCopyOffset()
        if (copyOffset === 0) {
          return output
        }
        const copyLength = decoder.nextCopyLength()
        for (let j = 0; j < copyLength; j++) {
          const idx = output.length - 2 * copyOffset
          output.push(output[idx]!, output[idx + 1]!)
        }
      }
    }
  }
}

export function decodeStackGraphics(input: Uint8Array): Tile[] {
  const linear = decodeStackGraphicsLinear(input)
  return convertTiles(linear)
}
