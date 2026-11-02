export type Page = {
  offset: number | null
  icon: string
  path: string
  name: string
}

export const PAGES: Page[] = [
  { offset: null, icon: '🏠', path: '/', name: 'Home' },
  { offset: 0x00, icon: '❕', path: '/map-sprites', name: 'Map sprites' },
  { offset: 0x08, icon: '❕', path: '/map-tilesets', name: 'Map tilesets' },
  { offset: 0x10, icon: '🖼️', path: '/portraits', name: 'Portraits' },
  { offset: 0x18, icon: '🦸', path: '/ally-battle-sprites', name: 'Ally battle sprites' },
  { offset: 0x20, icon: '🔪', path: '/weapon-sprites', name: 'Weapon sprites' },
  { offset: 0x28, icon: '🧟', path: '/enemy-battle-sprites', name: 'Enemy battle sprites' },
  { offset: 0x30, icon: '❕', path: '/backgrounds', name: 'Backgrounds' },
  { offset: 0x38, icon: '❕', path: '/grounds-graphics', name: 'Grounds graphics' },
  { offset: 0x40, icon: '❕', path: '/spell-graphics', name: 'Spell graphics' },
  { offset: 0x48, icon: '❔', path: '/unknown-0x48', name: 'Unknown 0x48' },
  { offset: 0x50, icon: '❔', path: '/unknown-0x50', name: 'Unknown 0x50' },
  { offset: 0x58, icon: '📖', path: '/compendium', name: 'Compendium' },
  { offset: 0x60, icon: '👤', path: '/character', name: 'Character data' },
  { offset: 0x68, icon: '💬', path: '/dialog', name: 'Dialog' },
  { offset: 0x70, icon: '🌀', path: '/icons', name: 'Icons' },
  { offset: 0x78, icon: '⛺️', path: '/camp-graphics', name: 'Camp graphics' },
  { offset: 0x80, icon: '❕', path: '/per-map-data', name: 'Per-map data' },
  { offset: 0x88, icon: '❕', path: '/battle-data', name: 'Battle data' },
  { offset: 0x90, icon: '❔', path: '/unknown-0x90', name: 'Unknown 0x90' },
  { offset: 0x98, icon: '❔', path: '/unknown-0x98', name: 'Unknown 0x98' },
  { offset: 0xa0, icon: '❔', path: '/unknown-0xa0', name: 'Unknown 0xa0' },
  { offset: 0xa8, icon: '📜', path: '/chapter-graphics', name: 'Chapter screen graphics' },
  { offset: null, icon: '🔢', path: '/bytes', name: 'Bytes' },
]
