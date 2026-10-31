import {
  decodeStackGraphics,
  parsePalette,
  type Tile,
  type Palette,
} from '../BattleSprites/graphics'
import { ByteReader, readU32be } from '../util'

export interface Portrait {
  index: number
  pointer: number
  eyeTiles: number[][]
  mouthTiles: number[][]
  palette: Palette
  tiles: Tile[]
}

const MAX_PORTRAITS = 64

export function decodePortrait(data: Uint8Array): {
  eyeTiles: number[][]
  mouthTiles: number[][]
  palette: Palette
  tiles: Tile[]
} | null {
  try {
    const reader = new ByteReader(data)

    const eyeCount = reader.nextU16()

    const eyeTiles: number[][] = []
    for (let i = 0; i < eyeCount; i++) {
      eyeTiles.push(reader.nextBytes(4))
    }

    const mouthCount = reader.nextU16()

    const mouthTiles: number[][] = []
    for (let i = 0; i < mouthCount; i++) {
      mouthTiles.push(reader.nextBytes(4))
    }

    const palette = parsePalette(Uint8Array.from(reader.nextBytes(32)))

    const tileData = data.subarray(reader.pos)
    const tiles = decodeStackGraphics(tileData)
    if (tiles?.length !== 64) return null

    return { eyeTiles, mouthTiles, palette, tiles }
  } catch {
    return null
  }
}

export function decodePortraits(bytes: Uint8Array): Portrait[] {
  const result: Portrait[] = []

  for (let i = 0; i < MAX_PORTRAITS; i++) {
    const entryOffset = i * 4
    if (entryOffset + 4 > bytes.length) break

    const pointer = readU32be(bytes, entryOffset)
    if (!pointer) break

    const regionOffset = pointer - 0x10000 - bytes.byteOffset
    if (regionOffset < 0 || regionOffset >= bytes.length) break

    const data = bytes.subarray(regionOffset)
    const decoded = decodePortrait(data)
    if (!decoded) break

    result.push({
      index: i,
      pointer,
      eyeTiles: decoded.eyeTiles,
      mouthTiles: decoded.mouthTiles,
      palette: decoded.palette,
      tiles: decoded.tiles,
    })
  }

  return result
}
