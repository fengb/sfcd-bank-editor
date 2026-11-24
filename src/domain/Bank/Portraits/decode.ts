import {
  decodeStackGraphics,
  parsePalette,
  type Tile,
  type Palette,
} from '../BattleSprites/graphics'
import { ByteReader, extractEntries } from '../util'
import type Portraits from './Portraits'

const MAX_PORTRAITS = 64

type TileMeta = [number, number, number, number]

export function decodePortrait(data: Uint8Array): {
  palette: Palette
  tiles: Tile[]
  baseTiles: Tile[]
  eyeTiles: { tile: Tile; target: number }[]
  mouthTiles: { tile: Tile; target: number }[]
} | null {
  const reader = new ByteReader(data)

  let eyeCount = reader.nextU16()
  const eyeMeta: TileMeta[] = []
  while (eyeCount-- > 0) {
    eyeMeta.push(reader.nextBytes(4))
  }

  let mouthCount = reader.nextU16()
  const mouthMeta: TileMeta[] = []
  while (mouthCount-- > 0) {
    mouthMeta.push(reader.nextBytes(4))
  }

  const palette = parsePalette(Uint8Array.from(reader.nextBytes(32)))

  const tiles = decodeStackGraphics(reader.rest())
  if (tiles?.length !== 64) {
    return null
  }

  const baseTiles = tiles.filter((_, i) => i % 8 < 6)

  function extractOverlayTile(meta: TileMeta): { tile: Tile; target: number } {
    const [xTgt, yTgt, xSrc, ySrc] = meta
    const tile = tiles![ySrc * 8 + xSrc]!
    return { tile, target: yTgt * 6 + xTgt }
  }

  return {
    palette,
    tiles,
    baseTiles,
    eyeTiles: eyeMeta.map(extractOverlayTile),
    mouthTiles: mouthMeta.map(extractOverlayTile),
  }
}

export function decode(target: Portraits, bytes: Uint8Array): boolean {
  target.portraits = []
  extractEntries(bytes, 0x10000 + bytes.byteOffset, MAX_PORTRAITS).forEach((entry, i) => {
    const decoded = decodePortrait(entry)
    if (!decoded) return
    target.portraits.push({
      index: i,
      palette: decoded.palette,
      tiles: decoded.tiles,
      baseTiles: decoded.baseTiles,
      eyeTiles: decoded.eyeTiles,
      mouthTiles: decoded.mouthTiles,
    })
  })
  return true
}
