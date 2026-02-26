// Sprite size targets for Spritey-compatible pipeline (16x16 or 32x32)
export const SPRITE_SIZES = {
  tile: 16,
  tower: 32,
  enemy: 32,
  projectile: 16,
  icon: 16,
};

// Maps texture keys to categories and file paths for PNG override loading.
// Particles are excluded — they are always procedurally generated.
export const ASSET_MANIFEST = [
  // Tiles (16x16)
  { key: 'tile_grass', category: 'tile', path: 'assets/tiles/tile_grass.png' },
  { key: 'tile_path', category: 'tile', path: 'assets/tiles/tile_path.png' },
  { key: 'tile_water', category: 'tile', path: 'assets/tiles/tile_water.png' },
  { key: 'tile_trees', category: 'tile', path: 'assets/tiles/tile_trees.png' },
  { key: 'tile_trees2', category: 'tile', path: 'assets/tiles/tile_trees2.png' },
  { key: 'tile_trees3', category: 'tile', path: 'assets/tiles/tile_trees3.png' },
  { key: 'tile_rocks', category: 'tile', path: 'assets/tiles/tile_rocks.png' },
  { key: 'tile_build', category: 'tile', path: 'assets/tiles/tile_build.png' },
  { key: 'tile_castle', category: 'tile', path: 'assets/tiles/tile_castle.png' },

  // Towers (32x32)
  { key: 'tower_arcane', category: 'tower', path: 'assets/towers/tower_arcane.png' },
  { key: 'tower_flame', category: 'tower', path: 'assets/towers/tower_flame.png' },
  { key: 'tower_frost', category: 'tower', path: 'assets/towers/tower_frost.png' },
  { key: 'tower_barracks', category: 'tower', path: 'assets/towers/tower_barracks.png' },
  { key: 'tower_lightning', category: 'tower', path: 'assets/towers/tower_lightning.png' },
  { key: 'tower_enchanter', category: 'tower', path: 'assets/towers/tower_enchanter.png' },

  // Enemies (32x32)
  { key: 'enemy_goblin', category: 'enemy', path: 'assets/enemies/enemy_goblin.png' },
  { key: 'enemy_wolf', category: 'enemy', path: 'assets/enemies/enemy_wolf.png' },
  { key: 'enemy_troll', category: 'enemy', path: 'assets/enemies/enemy_troll.png' },
  { key: 'enemy_harpy', category: 'enemy', path: 'assets/enemies/enemy_harpy.png' },
  { key: 'enemy_wraith', category: 'enemy', path: 'assets/enemies/enemy_wraith.png' },
  { key: 'enemy_priest', category: 'enemy', path: 'assets/enemies/enemy_priest.png' },
  { key: 'enemy_imp', category: 'enemy', path: 'assets/enemies/enemy_imp.png' },
  { key: 'enemy_dragon', category: 'enemy', path: 'assets/enemies/enemy_dragon.png' },
  { key: 'enemy_lich', category: 'enemy', path: 'assets/enemies/enemy_lich.png' },

  // Projectiles (16x16)
  { key: 'proj_arcane', category: 'projectile', path: 'assets/projectiles/proj_arcane.png' },
  { key: 'proj_flame', category: 'projectile', path: 'assets/projectiles/proj_flame.png' },
  { key: 'proj_frost', category: 'projectile', path: 'assets/projectiles/proj_frost.png' },
  { key: 'proj_lightning', category: 'projectile', path: 'assets/projectiles/proj_lightning.png' },

  // Icons (16x16)
  { key: 'icon_heart', category: 'icon', path: 'assets/icons/icon_heart.png' },
  { key: 'icon_coin', category: 'icon', path: 'assets/icons/icon_coin.png' },
];
