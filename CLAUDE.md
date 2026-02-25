# Arcane Defenders - Fantasy Tower Defence Game

## Project Overview
A web-based tower defence game set in a fantasy world with magic and monsters.
Built with Phaser 3, cartoon-style procedural graphics, persistent local leaderboard.

## Tech Stack
- **Engine**: Phaser 3
- **Build Tool**: Vite
- **Language**: JavaScript (ES modules)
- **Leaderboard**: localStorage
- **Art**: Procedural cartoon-style sprites via Phaser Graphics API

## Game Design

### Resolution & Rendering
- Base resolution: 480x270 (16:9, scales to any screen)
- Tile size: 16x16 pixels
- Phaser pixelArt mode enabled (nearest-neighbor scaling)
- Map grid: 30x17 tiles (480x272) with HUD overlay
- Sprite sizes: tiles 16x16, towers 24x24, enemies 20x20, projectiles 8x8, icons 12x12

### Tower Types (6)
1. **Arcane Turret** - Rapid fire magic bolts, single target, cheap
2. **Flame Brazier** - AoE fire damage with burn DOT
3. **Frost Spire** - Slows enemies, freezes at max upgrade
4. **Spirit Barracks** - Summons spectral warriors to block path
5. **Lightning Pylon** - Chain lightning between enemies
6. **Enchanter's Obelisk** - Buffs nearby tower damage/range

### Enemy Types (8)
1. **Goblin** - Basic grunt
2. **Wolf Rider** - Fast runner
3. **Troll** - Tank with HP regen
4. **Harpy** - Flying (ignores ground path)
5. **Wraith** - Stealth (invisible to unbuffed towers)
6. **Dark Priest** - Heals nearby enemies
7. **Imp Swarm** - Many weak enemies
8. **Dragon/Lich** - Bosses

### Levels (6)
1. The Emerald Forest - Tutorial (goblins only)
2. Mountain Pass - Introduces wolf riders, trolls
3. Misty Marshlands - Introduces harpies (flying)
4. The Haunted Ruins - Wraiths + dark priests
5. Dragon's Peak - All enemies, dragon boss
6. The Lich King's Throne - Final boss, hardest

### Upgrade System
- 3 linear upgrade tiers per tower
- Each upgrade improves damage, range, or attack speed
- Tier 3 unlocks a special ability

### Active Abilities (2)
1. **Meteor Strike** - AoE damage on click (60s cooldown)
2. **Healing Rain** - Heals barracks units (45s cooldown)

## Architecture

### Key Files
- `src/main.js` - Phaser game initialization
- `src/scenes/` - Boot, Menu, LevelSelect, Game, GameOver scenes
- `src/entities/` - Tower, Enemy, Projectile classes
- `src/managers/` - Wave, Economy, Leaderboard managers
- `src/data/` - Tower stats, enemy stats, level definitions
- `src/utils/` - Constants, cartoon sprite generator, path tracer

### Art Style & Sprite Generation
All sprites are generated procedurally at boot time in `src/utils/PixelArtGenerator.js`
using Phaser's Graphics API (`fillCircle`, `fillRect`, `fillRoundedRect`, `fillTriangle`, etc.).
No external image assets are used.

**Cartoon technique:** Each shape is drawn twice — first slightly larger in a dark outline
color (`0x1a1a2e`), then filled at normal size with a vibrant flat color. Helper functions
`oCircle`, `oRect`, and `oRRect` handle this outline+fill pattern.

**Texture keys (38 total):**
- 9 terrain tiles: `tile_grass`, `tile_path`, `tile_water`, `tile_trees`, `tile_trees2`, `tile_trees3`, `tile_rocks`, `tile_build`, `tile_castle`
- 6 towers: `tower_arcane`, `tower_flame`, `tower_frost`, `tower_barracks`, `tower_lightning`, `tower_enchanter`
- 9 enemies: `enemy_goblin`, `enemy_wolf`, `enemy_troll`, `enemy_harpy`, `enemy_wraith`, `enemy_priest`, `enemy_imp`, `enemy_dragon`, `enemy_lich`
- 4 projectiles: `proj_arcane`, `proj_flame`, `proj_frost`, `proj_lightning`
- 2 UI icons: `icon_heart`, `icon_coin`
- 8 particles: `particle_magic`, `particle_fire`, `particle_ice`, `particle_lightning`, `particle_heal`, `particle_death`, `particle_gold`, `range_circle`

**Contract:** `generateTextures(scene)` is the only export. All game code references
sprites by texture key string — changing art means only modifying this one file.

### Game Feel ("Juice")
- Screen shake on enemy kills
- Particle effects on tower shots and enemy deaths
- Floating damage numbers
- Gold "+N" floating text on kills
- Smooth enemy movement along paths
- Range circles on tower hover/select
- Wave announcement text
- Speed controls (1x, 2x)

## Commands
- `npm install` - Install dependencies
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run preview` - Preview production build

## Git Conventions
- Do NOT add Co-Authored-By lines to commit messages

## Design Principles
- Learn from the pros (Kingdom Rush, Bloons TD, Defender's Quest)
- No assumptions, ask instead
- Always improve
- It has to feel good
- Focus over information overload (Defender's Quest philosophy)
- Progressive complexity (sawtooth difficulty curve)
- Meaningful tower variety (rock/paper/scissors design)
