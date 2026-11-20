import { extractEntries, readU16be } from '../util'
import type { DecodedBattleSprite } from './BattleSprites'
import type BattleSprites from './BattleSprites'
import { decodeStackGraphics, parsePalettes, type Tile } from './graphics'

const MAX_SPRITES = 64

export function decode(target: BattleSprites, bytes: Uint8Array): boolean {
  const entries = extractEntries(bytes, 0x10000 + bytes.byteOffset, MAX_SPRITES)

  target.sprites = []

  for (const [i, block] of entries.entries()) {
    const decoded = decodeBattleSpriteBlock(block)
    if (!decoded) break
    target.sprites.push({
      index: i,
      animSpeed: decoded.animSpeed,
      unknown: decoded.unknown,
      palettes: decoded.palettes,
      frames: decoded.frames,
    })
  }
  return true
}

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

  const palettes = parsePalettes(palettesBlock)

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
