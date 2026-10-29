import { readU16be, readU32be } from '../util'
import { decodeStackGraphics, parsePalette, type Tile, type Palette } from './graphics'

export interface BattleSprite {
  index: number
  pointer: number
  animSpeed: number
  unknown: number
  palettes: Palette[]
  frames: Tile[][]
}

const SPRITE_BLOCK_SIZE = 0x4000
const MAX_SPRITES = 64

export function decodeBattleSprites(bytes: Uint8Array): BattleSprite[] {
  const result: BattleSprite[] = []

  for (let i = 0; i < MAX_SPRITES; i++) {
    const entryOffset = i * 4
    if (entryOffset + 4 > bytes.length) break

    const pointer = readU32be(bytes, entryOffset)
    if (!pointer) break

    const regionOffset = pointer - 0x10000 - bytes.byteOffset
    if (regionOffset < 0 || regionOffset + SPRITE_BLOCK_SIZE > bytes.length) break

    const block = bytes.subarray(regionOffset, regionOffset + SPRITE_BLOCK_SIZE)

    const decoded = decodeBattleSpriteBlock(block)
    if (!decoded) break
    result.push({
      index: i,
      pointer,
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

const PALETTE_OFFSET_FIELD = 4
const FRAME_TABLE_BASE = 6
const PALETTE_SIZE = 32

export function decodeBattleSpriteBlock(block: Uint8Array): DecodedBattleSprite | null {
  if (block.length < 8) return null
  const animSpeed = readU16be(block, 0)
  const unknown = readU16be(block, 2)

  const palettesOffset = PALETTE_OFFSET_FIELD + readU16be(block, PALETTE_OFFSET_FIELD)

  const frameTable = block.subarray(FRAME_TABLE_BASE)
  const tableLength = palettesOffset - FRAME_TABLE_BASE
  const frameSlotCount = Math.max(0, Math.floor(tableLength / 2))

  const firstFrameOffset = FRAME_TABLE_BASE + readU16be(frameTable, 0)

  if (
    palettesOffset < PALETTE_OFFSET_FIELD ||
    firstFrameOffset <= palettesOffset ||
    firstFrameOffset > block.length
  ) {
    return null
  }

  const paletteCount = Math.floor((firstFrameOffset - palettesOffset) / PALETTE_SIZE)
  if (paletteCount <= 0 || paletteCount >= 10) return null
  const palettes: Palette[] = Array.from({ length: paletteCount }, (_, i) =>
    parsePalette(
      block.subarray(palettesOffset + i * PALETTE_SIZE, palettesOffset + (i + 1) * PALETTE_SIZE),
    ),
  )

  const frames: Tile[][] = []
  for (let i = 0; i < frameSlotCount; i++) {
    const entry = i * 2
    const relFrameOffset = entry + readU16be(frameTable, entry)

    const nextEntry = entry + 2
    const relNextFrameOffset =
      i + 1 < frameSlotCount ? nextEntry + readU16be(frameTable, nextEntry) : frameTable.length

    if (relNextFrameOffset <= relFrameOffset || relNextFrameOffset > frameTable.length) {
      return null
    }

    const tileData = frameTable.subarray(relFrameOffset, relNextFrameOffset)
    let frame: Tile[]
    try {
      frame = decodeStackGraphics(tileData)
    } catch {
      return null
    }
    if (frame.length == 0) return null
    frames.push(frame)
  }

  return { animSpeed, unknown, palettes, frames }
}
