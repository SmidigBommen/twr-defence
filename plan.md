# Plan: Spritey Integration & Sprite Size Standardization

## Context

The game currently generates all 38 sprites procedurally in `PixelArtGenerator.js` (1225 lines) using Phaser's Graphics API. We want to support importing hand-drawn pixel art from [Spritey](https://github.com/SmidigBommen/spritey) (a browser-based pixel art editor that exports 16x16 and 32x32 PNGs). This enables custom art while keeping procedural generation as a fallback.

Current sprite sizes are irregular (tiles=16x16, towers=24x24, enemies=20x20, projectiles=8x8, icons=12x12). Standardizing to Spritey-compatible sizes (16x16 and 32x32) aligns the pipeline.

## Decisions

- **Override/fallback**: Load Spritey PNGs when present, fall back to procedural generation
- **Sizes**: tiles/projectiles/icons → 16x16, towers/enemies → 32x32, particles stay procedural
- **Assets**: `public/assets/` directory with PNGs named by texture key

## Implementation Steps

### Step 1: Create asset manifest (`src/data/assetManifest.js`) — NEW FILE

Single source of truth mapping texture keys → categories, sizes, file paths.

```js
export const SPRITE_SIZES = { tile: 16, tower: 32, enemy: 32, projectile: 16, icon: 16 };

export const ASSET_MANIFEST = [
  { key: 'tile_grass', category: 'tile', path: 'assets/tiles/tile_grass.png' },
  // ... all 30 non-particle texture keys
];
```

### Step 2: Create `public/assets/` directory structure

Empty directories: `tiles/`, `towers/`, `enemies/`, `projectiles/`, `icons/`. Add a `.gitkeep` in each so they're tracked. Vite serves `public/` as static root automatically.

### Step 3: Add `SPRITE_SIZES` to constants (`src/utils/constants.js`)

```js
export const SPRITE_SIZES = { TILE: 16, TOWER: 32, ENEMY: 32, PROJECTILE: 16, ICON: 16 };
```

### Step 4: Refactor PixelArtGenerator (`src/utils/PixelArtGenerator.js`)

**Goal**: Support per-key fallback generation + canvas-based size scaling.

Changes:
1. Modify `gen()` helper to accept target size and scale via canvas `drawImage` with `imageSmoothingEnabled = false` (nearest-neighbor). Procedural art is still drawn at original sizes (24x24 towers, etc.) but output texture is rescaled to target size (32x32). This avoids rewriting all 1225 lines of coordinate math.

2. Export `generateFallbackTextures(scene)` that checks `scene.textures.exists(key)` before generating each texture. Particles always generate (not in manifest).

3. Keep `generateTextures(scene)` as-is for backward compat (calls all generators unconditionally).

4. Update all `gen()` call sites to pass target sizes:
   - Tile generators: `gen(g, key, 16, 16)` — no change (already 16x16)
   - Tower generators: `gen(g, key, 24, 24, 32, 32)` — scale 24→32
   - Enemy generators: `gen(g, key, 20, 20, 32, 32)` — scale 20→32
   - Projectile generators: `gen(g, key, 8, 8, 16, 16)` — scale 8→16
   - Icon generators: `gen(g, key, 12, 12, 16, 16)` — scale 12→16

### Step 5: Rewrite BootScene (`src/scenes/BootScene.js`)

Add `preload()` to load PNGs from manifest. In `create()`, call `generateFallbackTextures()` for any keys that weren't loaded.

### Step 6: Update enemy size values (`src/data/enemies.js`)

Enemy base size changes from 20x20 to 32x32 (1.6x larger). Recalibrate `size` multipliers:

| Enemy | Old size | New size | Display (px) |
|-------|----------|----------|--------------|
| Goblin | 1 | 1 | 32 |
| Wolf Rider | 1 | 1 | 32 |
| Troll | 2 | 1.25 | 40 |
| Harpy | 1 | 1 | 32 |
| Wraith | 1 | 1 | 32 |
| Dark Priest | 1 | 1 | 32 |
| Imp | 0.7 | 0.5 | 16 |
| Dragon | 3 | 1.9 | ~61 |
| Lich | 2.5 | 1.6 | ~51 |

### Step 7: Update Tower.js (`src/entities/Tower.js`)

- Base circle radius: `8` → `SPRITE_SIZES.TOWER / 3` (~10)
- Projectile spawn offset: `this.y - 4` → `this.y - SPRITE_SIZES.TOWER / 4` (-8)
- Lightning bolt origin: same fix

### Step 8: Update Enemy.js (`src/entities/Enemy.js`)

- Shadow ellipse: `10, 4` → derive from `SPRITE_SIZES.ENEMY`
- Health bar Y offset: `this.y - 10 * this.size` → `this.y - (SPRITE_SIZES.ENEMY / 2) * this.size`
- Boss glow radius: `12 * this.size` → `SPRITE_SIZES.ENEMY * 0.4 * this.size`

### Step 9: Update Projectile.js (`src/entities/Projectile.js`)

- Remove or adjust `setScale(0.8)` for 16x16 base

### Step 10: Update GameScene.js build panel icon scale

- Line 385: `icon.setScale(0.5)` — with 32px textures this gives 16px display. Acceptable.

### Step 11: Update CLAUDE.md documentation

## Files Changed

| File | Action |
|------|--------|
| `src/data/assetManifest.js` | CREATE |
| `public/assets/` dirs | CREATE |
| `src/utils/constants.js` | EDIT |
| `src/utils/PixelArtGenerator.js` | EDIT |
| `src/scenes/BootScene.js` | EDIT |
| `src/data/enemies.js` | EDIT |
| `src/entities/Tower.js` | EDIT |
| `src/entities/Enemy.js` | EDIT |
| `src/entities/Projectile.js` | EDIT |
| `CLAUDE.md` | EDIT |

## Verification

1. Run with empty `public/assets/` — all sprites render via fallback, game identical to current
2. Drop one Spritey PNG — it overrides that texture, rest stay procedural
3. Check sizes in console: `game.textures.get('tower_arcane').getSourceImage().width` → 32
4. Visual check: tower placement, health bars, projectiles, boss glow, build panel, editor
5. `npm run build` + `npm run preview` succeed
