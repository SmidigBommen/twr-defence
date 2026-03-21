# Plan: Path Autotiling System

## Context

Path tiles currently use a single `tile_path` texture for all path cells regardless of direction. This causes:
- No visual distinction between horizontal, vertical, and corner segments
- Dark borders on all 4 edges create ugly seams between adjacent path tiles
- No directional cues — the road doesn't "flow" toward enemy movement direction

## Approach: Rotation-Based Autotiling

Create 5 base path tile shapes. At render time, examine each path cell's 4 cardinal neighbors to build a 4-bit bitmask, then look up the correct tile variant + rotation angle.

### Base Shapes (canonical orientation)

| Shape | Texture Key | Connected Sides | Description |
|-------|------------|-----------------|-------------|
| Straight | `tile_path_straight` | N+S | Vertical dirt strip, grass on left/right |
| Corner | `tile_path_corner` | N+E | L-shaped dirt, grass on outer edges |
| T-Junction | `tile_path_tjunction` | N+E+S | T-shaped, grass on west edge only |
| Cross | `tile_path` (existing) | N+E+S+W | Full dirt (current tile, no grass edges) |
| End Cap | `tile_path_end` | N only | Dead-end stub, grass on 3 sides |

### Bitmask System

```
Bit 0 (1) = North    Bit 1 (2) = East
Bit 2 (4) = South    Bit 3 (8) = West
```

16 possible values → lookup table of `{ key, angle }`.

| Mask | Neighbors | Tile | Angle |
|------|-----------|------|-------|
| 0 | none | cross | 0 |
| 1 | N | end | 0 |
| 2 | E | end | 90 |
| 3 | N+E | corner | 0 |
| 4 | S | end | 180 |
| 5 | N+S | straight | 0 |
| 6 | E+S | corner | 90 |
| 7 | N+E+S | tjunction | 0 |
| 8 | W | end | 270 |
| 9 | N+W | corner | 270 |
| 10 | E+W | straight | 90 |
| 11 | N+E+W | tjunction | 270 |
| 12 | S+W | corner | 180 |
| 13 | N+S+W | tjunction | 180 |
| 14 | E+S+W | tjunction | 90 |
| 15 | all | cross | 0 |

### Path-like cells for neighbor detection
PATH, START, END, BRIDGE are all "path-like" — they count as connected neighbors.
END cells keep `tile_castle` texture (not autotiled themselves).

## Implementation Steps

### Step 1: `src/utils/pathAutotile.js` — NEW FILE
Pure function `getPathTile(map, x, y)` → `{ key, angle }`. Bitmask + lookup table. No Phaser dependency.

### Step 2: `src/utils/PixelArtGenerator.js` — ADD 4 generators
`genTilePathStraight`, `genTilePathCorner`, `genTilePathTJunction`, `genTilePathEnd`.
Each draws grass background + dirt path shape at 16x16, scaled to 32x32.
Register in `generateFallbackTextures()`. Keep existing `genTilePath` as cross variant.

### Step 3: `src/data/assetManifest.js` — ADD 4 entries
New tile keys for PNG override support.

### Step 4: `src/scenes/GameScene.js` — MODIFY renderMap
Import `getPathTile`, use it for path-like cells (not END), apply `setAngle()`.

### Step 5: `src/editor/core/MapRenderer.js` — MODIFY render
Import `getPathTile`, use it with Canvas rotation for WYSIWYG preview.

### Step 6: `CLAUDE.md` — UPDATE texture key list

## Files Changed

| File | Action |
|------|--------|
| `src/utils/pathAutotile.js` | CREATE |
| `src/utils/PixelArtGenerator.js` | EDIT |
| `src/data/assetManifest.js` | EDIT |
| `src/scenes/GameScene.js` | EDIT |
| `src/editor/core/MapRenderer.js` | EDIT |
| `CLAUDE.md` | EDIT |

## Verification

1. Run game — path tiles should show directional connectivity (grass edges on non-connected sides)
2. Check all 6 levels for correct autotiling (no mismatched corners/straights)
3. Level editor WYSIWYG should match game rendering
4. Isolated path cells render as cross/full-dirt (graceful fallback)
5. `npm run build` succeeds
