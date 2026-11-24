import type { Color, ColorChannel } from '@/domain/Bank/BattleSprites'

/** Map to 8-bit intensity. */
export const CHANNEL_LEVELS: Record<ColorChannel, number> = [0, 52, 87, 116, 144, 172, 206, 255]

export function paletteRgb(color: Color): string {
  return `rgb(${CHANNEL_LEVELS[color[0]]}, ${CHANNEL_LEVELS[color[1]]}, ${CHANNEL_LEVELS[color[2]]})`
}
