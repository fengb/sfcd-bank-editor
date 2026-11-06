export class ByteReader {
  pos: number

  constructor(readonly data: Uint8Array) {
    this.data = data
    this.pos = 0
  }

  nextBytes(n: 1): [number]
  nextBytes(n: 2): [number, number]
  nextBytes(n: 3): [number, number, number]
  nextBytes(n: 4): [number, number, number, number]
  nextBytes(n: number): number[]
  nextBytes(n: number): number[] {
    const out = Array.from(this.data.subarray(this.pos, this.pos + n))
    this.pos += n
    return out
  }

  nextBits(n: number): number[] {
    if (n % 8 != 0) {
      throw new Error('nextBits must be divisible by 8')
    }
    const bytes = this.nextBytes(n / 8)
    return Array.from({ length: n }, (_, i) => {
      const byte = bytes[i >> 3]!
      return (byte >> (7 - (i % 8))) & 1
    })
  }

  nextU8(): number {
    if (this.pos + 1 > this.data.length) {
      throw new RangeError('Unexpected end of input')
    }
    const value = this.data[this.pos]!
    this.pos += 1
    return value
  }

  nextU16(): number {
    const [high, low] = this.nextBytes(2)
    return (high << 8) | low
  }

  nextU32(): number {
    const bytes = this.nextBytes(4)
    return ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | (bytes[3] << 0)) >>> 0
  }

  rest(): Uint8Array {
    return this.data.subarray(this.pos)
  }
}

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

export class BitReader {
  private pos = 0

  constructor(private readonly data: Uint8Array) {}

  nextBit(): number {
    if (this.pos >= this.data.length * 8) return 0
    const byte = this.data[this.pos >> 3]!
    const bit = (byte >> (7 - (this.pos & 7))) & 1
    this.pos++
    return bit
  }

  skipBits(n: number): void {
    this.pos += n
  }

  nextBitsValue(n: number): number {
    let value = 0
    for (let i = 0; i < n; i++) value = (value << 1) | this.nextBit()
    return value
  }

  nextPrefixCodeLookup<T>(mapping: Record<string, T>): T | undefined {
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
}
