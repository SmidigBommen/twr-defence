# Arcane Defenders - Fantasy Tower Defence Game

## Project Overview
A web-based tower defence game set in a fantasy world with magic and monsters.
Built with Phaser 3, cartoon-style procedural graphics, persistent local leaderboard.

## Tech Stack
- **Engine**: Phaser 3
- **Build Tool**: Vite
- **Language**: JavaScript (ES modules)
- **Leaderboard**: localStorage
- **Art**: Spritey PNG overrides + procedural cartoon-style fallback via Phaser Graphics API

## Game Design

### Resolution & Rendering
- Base resolution: 480x270 (16:9, scales to any screen)
- Tile size: 16x16 pixels
- Phaser pixelArt mode enabled (nearest-neighbor scaling)
- Map grid: 30x17 tiles (480x272) with HUD overlay
- Sprite sizes: all 32x32 textures (unified Spritey workflow), displayed at appropriate sizes via setDisplaySize/setScale

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
- `src/data/` - Tower stats, enemy stats, level definitions, asset manifest
- `src/utils/` - Constants, cartoon sprite generator, path tracer
- `plan.md` - full plan and milestones in the project. This file is updated before coding starts.

### Art Style & Asset Pipeline
Sprites are loaded as PNGs from `public/assets/` when present, falling back to procedural
generation in `src/utils/PixelArtGenerator.js`. This supports importing hand-drawn pixel
art from [Spritey](https://github.com/SmidigBommen/spritey) (all 32x32 PNGs).

**Asset directory structure:**
- `public/assets/tiles/` — 32x32 tile PNGs
- `public/assets/towers/` — 32x32 tower PNGs
- `public/assets/enemies/` — 32x32 enemy PNGs
- `public/assets/projectiles/` — 32x32 projectile PNGs
- `public/assets/icons/` — 32x32 icon PNGs

**Override mechanism:** `BootScene.preload()` loads PNGs listed in `src/data/assetManifest.js`.
`BootScene.create()` calls `generateFallbackTextures()` which only generates textures for
keys that weren't loaded from PNGs. Particles are always procedural.

**Procedural fallback technique:** Each shape is drawn twice — first slightly larger in a dark outline
color (`0x1a1a2e`), then filled at normal size with a vibrant flat color. Helper functions
`oCircle`, `oRect`, and `oRRect` handle this outline+fill pattern. Procedural art is drawn at
original sizes then rescaled to target sizes via nearest-neighbor canvas scaling.

**Texture keys (38 total):**
- 9 terrain tiles: `tile_grass`, `tile_path`, `tile_water`, `tile_trees`, `tile_trees2`, `tile_trees3`, `tile_rocks`, `tile_build`, `tile_castle`
- 6 towers: `tower_arcane`, `tower_flame`, `tower_frost`, `tower_barracks`, `tower_lightning`, `tower_enchanter`
- 9 enemies: `enemy_goblin`, `enemy_wolf`, `enemy_troll`, `enemy_harpy`, `enemy_wraith`, `enemy_priest`, `enemy_imp`, `enemy_dragon`, `enemy_lich`
- 4 projectiles: `proj_arcane`, `proj_flame`, `proj_frost`, `proj_lightning`
- 2 UI icons: `icon_heart`, `icon_coin`
- 8 particles: `particle_magic`, `particle_fire`, `particle_ice`, `particle_lightning`, `particle_heal`, `particle_death`, `particle_gold`, `range_circle`

**Contract:** All game code references sprites by texture key string. To override a sprite,
drop a PNG named `<key>.png` into the matching `public/assets/<category>/` directory.

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

## Conventions

- Keep files small and focused — one class per file
- No build step, no transpilation, no bundler
- Use CSS custom properties for theming (all in `:root` in style.css)
- Tools should never modify UI directly — emit events instead
- Prefer `const` over `let`, no `var`
- Use a MVP approach
- Use well known principles and patterns in your code
- Create a plan.md file with the implementation plan before starting development
- Never add Co-Authored-By or any AI attribution to commit messages

## IMPORTANT PROGRAMMING RULES:
- Minimize code, be DRY
  - Code is liability, logic is an opportunity for bugs
  - We should have as little code as necessary to solve the problem
  - Duplicated logic leads to drift and inconsistency which leads to tech debt, bugs and progress slowdown
  - Important for both source- and test-code
    - Examples:
      - Reusable functions, fixtures, types
      - Prefer table-driven/parameterized tests
      - Create consts and variables for strings/numbers when they are repeated
- Code should be clear and easily readable
- Don't prematurely build abstractions
- Use the right algorithms and datastructures for the problem
- Fix root causes (no band-aid solutions)
- Minimize external dependencies
- Be defensive
  - Examples:
    - Validation for arguments and parameters
    - Bounds and limits for sizes, parallelism etc
- Fail fast/early
- Return errors for user errors, use assertions for critical invariants and programmer errors
- Prefer pure code - easily testable
- Domain models should be free from infrastructure and dependencies
- Parse, dont validate. Prefer representations that prevent invalid states by design
- Be performant
  - Avoid unneeded work and allocations
  - Non-pessimize (don't write slow code for no reason)
  - Examples:
    - Minimize heap allocations (preallocate, reuse allocations, avoid closures, use stack, escape-analysis-friendly code)
    - CPU cache friendly datastructures, algorithms and layout
    - Minimize contention in parallel code
    - Pass by value for small arguments (~16 bytes or less)
    - Batching operations
- Comments should explain _why_ something is done, never _what_ is being done
  - Avoid obvious comments, we only want comments that explain non-obvious reasoning
  - Should have comments: "magic numbers/strings" and non-obvious configuration values
- Strict linting and static analysis
  - Don't suppress lints or warnings without a very good reason
- Warnings should be treated as errors
  - Suppressions should be documented and well-reasoned

## IMPORTANT BEHAVIORAL RULES:
- In all interactions, be extremely concise
- Be direct and straightforward in all responses
- Avoid overly positive or enthusiastic language
- Challenge assumptions and point out potential issues or flaws
- Provide constructive criticism
- Verify assumptions before proceeding
