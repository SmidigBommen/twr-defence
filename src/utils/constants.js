// Game dimensions
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 270;
export const TILE_SIZE = 16;
export const GRID_COLS = 30;
export const GRID_ROWS = 17;

// Sprite size targets (Spritey-compatible: 16x16 or 32x32)
export const SPRITE_SIZES = {
  TILE: 16,
  TOWER: 32,
  ENEMY: 32,
  PROJECTILE: 16,
  ICON: 16,
};

// Map cell types
export const CELL = {
  EMPTY: 0,
  PATH: 1,
  BUILD: 2,
  WATER: 3,
  TREES: 4,
  ROCKS: 5,
  START: 6,
  END: 7,
  BRIDGE: 8,
};

// Fantasy color palette (16-bit inspired)
export const COLORS = {
  // Backgrounds
  BLACK: 0x0a0a1a,
  DARK_BG: 0x1a1a2e,

  // Nature
  GRASS_DARK: 0x2d5a27,
  GRASS: 0x3e8948,
  GRASS_LIGHT: 0x63c74d,
  TREE_DARK: 0x265c42,
  TREE_TRUNK: 0x5a3a28,

  // Path
  PATH_DARK: 0x6b4226,
  PATH: 0x8b6914,
  PATH_LIGHT: 0xb8860b,

  // Water
  WATER_DARK: 0x124e89,
  WATER: 0x0099db,
  WATER_LIGHT: 0x2ce8f5,

  // Stone
  STONE_DARK: 0x3a3a5c,
  STONE: 0x5a5a7a,
  STONE_LIGHT: 0x8a8aaa,

  // Tower colors
  ARCANE_PRIMARY: 0x7b2fbe,
  ARCANE_SECONDARY: 0x2ce8f5,
  FLAME_PRIMARY: 0xc0392b,
  FLAME_SECONDARY: 0xe67e22,
  FROST_PRIMARY: 0x85c1e9,
  FROST_SECONDARY: 0xffffff,
  BARRACKS_PRIMARY: 0x7f8c8d,
  BARRACKS_SECONDARY: 0xbdc3c7,
  LIGHTNING_PRIMARY: 0xf1c40f,
  LIGHTNING_SECONDARY: 0x3498db,
  ENCHANTER_PRIMARY: 0x27ae60,
  ENCHANTER_SECONDARY: 0xf1c40f,

  // Enemy colors
  GOBLIN: 0x4a8c3f,
  WOLF: 0x7f8c8d,
  TROLL: 0x2d5a27,
  HARPY: 0x8e44ad,
  WRAITH: 0x85c1e9,
  PRIEST: 0x8b1a1a,
  IMP: 0xc0392b,
  DRAGON: 0x8b0000,
  LICH: 0x6c3483,

  // UI
  GOLD: 0xffd700,
  RED: 0xe74c3c,
  GREEN: 0x2ecc71,
  WHITE: 0xecf0f1,
  UI_BG: 0x1a1a2e,
  UI_BORDER: 0x4a4a6a,
  UI_HIGHLIGHT: 0xffd700,
  HEALTH_GREEN: 0x2ecc71,
  HEALTH_RED: 0xe74c3c,
  HEALTH_BG: 0x1a1a1a,

  // Effects
  MAGIC_PURPLE: 0xbb6bd9,
  FIRE_ORANGE: 0xff6b35,
  ICE_BLUE: 0x74b9ff,
  LIGHTNING_YELLOW: 0xffeaa7,
  HEAL_GREEN: 0x55efc4,
};

// Game balance
export const BALANCE = {
  STARTING_GOLD: 100,
  STARTING_LIVES: 20,
  GOLD_PER_WAVE_BONUS: 25,
  SELL_REFUND_RATIO: 0.6,

  // Score multipliers
  SCORE_PER_KILL: 10,
  SCORE_PER_WAVE: 100,
  SCORE_PER_LIFE: 50,
  SCORE_LEVEL_COMPLETE: 500,
};

// Tower targeting modes
export const TARGET_MODE = {
  FIRST: 'first',
  LAST: 'last',
  NEAREST: 'nearest',
  STRONGEST: 'strongest',
};

// Enemy status effects
export const STATUS = {
  SLOW: 'slow',
  BURN: 'burn',
  FREEZE: 'freeze',
  REVEAL: 'reveal',
};

// Tower type IDs
export const TOWER_TYPES = {
  ARCANE: 'arcane',
  FLAME: 'flame',
  FROST: 'frost',
  BARRACKS: 'barracks',
  LIGHTNING: 'lightning',
  ENCHANTER: 'enchanter',
};

// Enemy type IDs
export const ENEMY_TYPES = {
  GOBLIN: 'goblin',
  WOLF_RIDER: 'wolf_rider',
  TROLL: 'troll',
  HARPY: 'harpy',
  WRAITH: 'wraith',
  DARK_PRIEST: 'dark_priest',
  IMP: 'imp',
  DRAGON: 'dragon',
  LICH: 'lich',
};
