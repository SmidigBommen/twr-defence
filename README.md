# Arcane Defenders

A fantasy tower defence game built with Phaser 3. Defend the realm against goblins, trolls, harpies, wraiths, and dragons using six unique tower types across six hand-crafted levels.

## Getting Started

```bash
npm install
npm run dev
```

Open the URL shown in the terminal. The game runs at 480x270 and scales to fit any screen.

### Other Commands

```bash
npm run build     # Production build
npm run preview   # Preview production build
```

## Gameplay

Build towers on golden build spots to stop waves of enemies from reaching the castle. Earn gold from kills and wave completions to build and upgrade your defences.

### Towers

| Tower | Cost | Description |
|-------|------|-------------|
| Arcane Turret | 50g | Rapid fire magic bolts, single target |
| Flame Brazier | 75g | AoE fire damage with burn DOT |
| Frost Spire | 60g | Slows enemies, tier 3 freezes |
| Spirit Barracks | 70g | Blocks and damages ground enemies |
| Lightning Pylon | 90g | Chain lightning between enemies |
| Enchanter's Obelisk | 80g | Buffs nearby tower damage and range |

Each tower has 3 upgrade tiers. Tier 3 unlocks a special ability (piercing shots, inferno, freeze, shield, stun, or stealth reveal).

Towers unlock progressively: Arcane and Flame from level 1, Frost and Barracks from level 2, Lightning from level 3, Enchanter from level 4.

### Enemies

| Enemy | Trait |
|-------|-------|
| Goblin | Basic grunt |
| Wolf Rider | Fast |
| Troll | High HP, regenerates |
| Harpy | Flying (ignores ground path) |
| Wraith | Stealth (invisible to unbuffed towers) |
| Dark Priest | Heals nearby enemies |
| Imp | Swarms of weak units |
| Dragon | Flying boss |
| Lich King | Final boss, summons and shields |

### Abilities

- **Meteor Strike** - Click to target an area for AoE fire damage + burn (45s cooldown)

### Controls

- **Click** golden tiles to build towers
- **Click** a tower to see stats, upgrade, or sell
- **Space** to pause/unpause
- **Esc** to deselect
- **1x/2x** button to toggle game speed

## Sprites

Sprites are loaded from PNGs in `public/assets/` when present, falling back to procedural generation via `src/utils/PixelArtGenerator.js`. All textures are 32×32. Display sizes differ by type:

| Type | Display size | Notes |
|------|-------------|-------|
| Terrain tiles | 16×16 | 1:1 with the tile grid |
| Towers | 32×32 | 2× tile — visually prominent |
| Enemies | 20×20 | 1.25× tile — readable but subordinate |
| Projectiles | varies | scaled per projectile type |

### Texture Keys

| Category | Keys |
|----------|------|
| Terrain | `tile_grass`, `tile_path`, `tile_water`, `tile_trees`, `tile_trees2`, `tile_trees3`, `tile_rocks`, `tile_build`, `tile_castle` |
| Towers | `tower_arcane`, `tower_flame`, `tower_frost`, `tower_barracks`, `tower_lightning`, `tower_enchanter` |
| Enemies | `enemy_goblin`, `enemy_wolf`, `enemy_troll`, `enemy_harpy`, `enemy_wraith`, `enemy_priest`, `enemy_imp`, `enemy_dragon`, `enemy_lich` |
| Projectiles | `proj_arcane`, `proj_flame`, `proj_frost`, `proj_lightning` |
| Icons | `icon_heart`, `icon_coin` |
| Particles | `particle_magic`, `particle_fire`, `particle_ice`, `particle_lightning`, `particle_heal`, `particle_death`, `particle_gold`, `range_circle` |

### Adding or Replacing Sprites

Drop a 32×32 PNG named `<key>.png` into the matching `public/assets/<category>/` directory. The boot scene loads PNGs listed in `src/data/assetManifest.js` and only falls back to procedural generation for keys not loaded from disk.

See `public/assets/CREDITS.txt` for third-party asset attributions.

## Level Editor

The game includes a built-in level editor accessible from the main menu via the **EDITOR** button.

### Tools

Paint tiles onto the 30x17 grid using the toolbar at the bottom. Each tool has a keyboard shortcut:

| Key | Tool | Description |
|-----|------|-------------|
| 1 | Grass | Empty/default terrain |
| 2 | Path | Enemy walking route |
| 3 | Build | Tower placement spot |
| 4 | Tree | Decorative blocking terrain |
| 5 | Rock | Decorative blocking terrain |
| 6 | Water | Decorative blocking terrain |
| 7 | Start | Enemy spawn point (one per map) |
| 8 | End | Castle / goal (one per map) |
| 9 | Bridge | Path over water |

Click and drag to paint. Start and End tiles are unique — placing a new one removes the old one.

### Waypoints

Enemies follow waypoints along the path. There are two ways to set them up:

- **Auto-trace (A)** — Automatically walks the path from Start to End and places waypoints at every turn. Works well for simple paths.
- **Manual mode (W)** — Toggle waypoint mode, then click tiles to place waypoints in order. Click an existing waypoint to remove it.

### Other Editor Actions

| Key | Action |
|-----|--------|
| T | Test the path (animates a dot following the waypoints) |
| E | Export the map and waypoints to clipboard as code |
| G | Toggle grid overlay |
| C | Clear the entire map |
| Z | Undo last paint action |
| Esc | Return to main menu |

### Loading Existing Levels

Click the level numbers (1-6) in the top bar to load any built-in level for editing or reference.

### Using Exported Levels

Press **E** to export. The editor copies a `parseMap([...])` and `waypoints: [...]` code block to your clipboard. Paste this into `src/data/levels.js` inside a new level object to add it to the game.
