import { isNotNil } from 'es-toolkit'

import {
  decodeStackGraphics,
  parsePalette,
  type Tile,
  type Palette,
} from '../BattleSprites/graphics'
import { ByteReader, extractEntries } from '../util'

interface OverlayTile {
  tile: Tile
  target: number
}

export interface Portrait {
  index: number
  palette: Palette
  baseTiles: Tile[]
  eyeTiles: OverlayTile[]
  mouthTiles: OverlayTile[]
}

const MAX_PORTRAITS = 64

type TileMeta = [number, number, number, number]

export function decodePortrait(data: Uint8Array): {
  palette: Palette
  baseTiles: Tile[]
  eyeTiles: OverlayTile[]
  mouthTiles: OverlayTile[]
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

  const allTiles = decodeStackGraphics(reader.rest())
  if (allTiles?.length !== 64) {
    return null
  }

  const baseTiles = allTiles.filter((_, i) => i % 8 < 6)

  function extractOverlayTile(meta: TileMeta): OverlayTile {
    const [xTgt, yTgt, xSrc, ySrc] = meta
    const tile = allTiles![ySrc * 8 + xSrc]!
    return { tile, target: yTgt * 6 + xTgt }
  }

  return {
    palette,
    baseTiles,
    eyeTiles: eyeMeta.map(extractOverlayTile),
    mouthTiles: mouthMeta.map(extractOverlayTile),
  }
}

export function decodePortraits(bytes: Uint8Array): Portrait[] {
  return extractEntries(bytes, 0x10000 + bytes.byteOffset, MAX_PORTRAITS)
    .map((entry, i) => {
      const decoded = decodePortrait(entry)!
      if (!decoded) {
        return null
      }
      return {
        index: i,
        palette: decoded.palette,
        baseTiles: decoded.baseTiles,
        eyeTiles: decoded.eyeTiles,
        mouthTiles: decoded.mouthTiles,
      }
    })
    .filter(isNotNil)
}
