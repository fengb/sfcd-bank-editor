import { chunk } from 'es-toolkit'

import { extractRecords, readU16be } from '../util'
import { decodeStackGraphics, parsePalette, type Tile, type Palette } from './graphics'

export interface BattleSprite {
  index: number
  animSpeed: number
  unknown: number
  palettes: Palette[]
  frames: Tile[][]
}

const MAX_SPRITES = 64

export function decodeBattleSprites(bytes: Uint8Array): BattleSprite[] {
  const records = extractRecords(bytes, 0x10000 + bytes.byteOffset, MAX_SPRITES)

  const result: BattleSprite[] = []

  for (const [i, block] of records.entries()) {
    const decoded = decodeBattleSpriteBlock(block)
    if (!decoded) break
    result.push({
      index: i,
      animSpeed: decoded.animSpeed,
      unknown: decoded.unknown,
      palettes: decoded.palettes,
      frames: decoded.frames,
    })
  }

  return result
}

export type DecodedBattleSprite = {
  animSpeed: number
  unknown: number
  palettes: Palette[]
  frames: Tile[][]
}

const PALETTE_SIZE = 32

function readOffset(block: Uint8Array, lookup: number): number {
  return lookup + readU16be(block, lookup)
}

export function decodeBattleSpriteBlock(block: Uint8Array): DecodedBattleSprite | null {
  if (block.length < 8) return null
  const animSpeed = readU16be(block, 0x00)
  const unknown = readU16be(block, 0x02)

  const headerStart = 0x06
  const palettesStart = readOffset(block, 0x04)
  const dataStart = readOffset(block, 0x06)

  const palettesBlock = block.subarray(palettesStart, dataStart)
  if (palettesBlock.length < 0 || palettesBlock.length > 320) return null

  const palettes = chunk([...palettesBlock], PALETTE_SIZE).map(parsePalette)

  const headerBlock = block.subarray(headerStart)
  const headerCount = (palettesStart - headerStart) / 2
  const frames: Tile[][] = []
  for (let i = 0; i < headerCount; i++) {
    const offset = readOffset(headerBlock, i * 2)
    const tileData = headerBlock.subarray(offset)
    const frame = decodeStackGraphics(tileData)
    if (!frame?.length) return null

    frames.push(frame)
  }

  return { animSpeed, unknown, palettes, frames }
}
