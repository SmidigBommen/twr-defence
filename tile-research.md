# Tile Size Research: 16px vs 32px for Arcane Defenders

## What Popular Games Use

| Game | Resolution | Tile Size | Notes |
|------|-----------|-----------|-------|
| Shovel Knight | 400×240 | 16×16 | 25×15 tile grid, matches NES vertical tile count |
| Celeste | 320×180 | ~8×8 gameplay tiles | Saint11's baseline, scales 6x to 1080p cleanly |
| Hyper Light Drifter | 480×270 | ~16×16 | Same base res as us |
| RPG Maker VX | varies | 32×32 | More "modern" look |
| Kingdom Rush | ~720p native | N/A | Vector art, not pixel art — irrelevant to us |
| Bloons TD 6 | scales to any | N/A | Unity, vector/raster hybrid, no fixed tile grid |

Shovel Knight is the most relevant reference: 16×16 tiles at 400×240 (close to our 480×270) with 16×16 tiles. The developers deliberately kept NES-era 16×16 tiles while only expanding horizontally.

## Tile/Sprite Size Relationship

The standard pattern across pixel art games:

- **Tiles define the logical grid** — the unit of space for placement, pathfinding, and terrain.
- **Sprites can and should be larger than tiles** — characters/towers typically 1.5x–2x the tile size so they read clearly.
- Common pairs: 16px tile / 32px sprite, 32px tile / 48-64px sprite.

Our current setup (16px tile / 32px sprite displayed at ~16px) is inverted from this: sprites are stored at 32px but scaled *down* to fit a 16px tile. This causes sprites to display at 1:1 with the tile, which makes towers look squat and hard to distinguish. The intent was a unified Spritey 32×32 workflow, but the visual result is that towers don't stand out from the terrain they sit on.

The correct relationship is: **sprites should visually occupy 1.5–2 tiles of vertical space** so they read above the ground plane.

## Base Resolution for Our Game

Key constraint: base resolution must divide evenly into 1080p (1920×1080) for clean integer scaling.

| Resolution | Scale to 1080p | Tile size | Grid at 16px tiles |
|-----------|---------------|-----------|-------------------|
| 320×180 | 6x | 16px | 20×11 (too small for TD) |
| 384×216 | 5x | 16px | 24×13 |
| 400×240 | 4.5x (not integer!) | 16px | 25×15 |
| **480×270** | **4x** | **16px** | **30×17** (our current) |
| 640×360 | 3x | 16px | 40×22 |
| 960×540 | 2x | 32px | 30×17 |

Our current 480×270 at 4x integer scale to 1080p is correct and well-chosen. The grid of 30×17 tiles is a reasonable TD map size — Kingdom Rush levels are typically 25–35 tiles wide.

Switching to 960×540 with 32px tiles gives the same 30×17 grid but at 2x scale to 1080p. This works, but at 2x you lose the retro aesthetic and the game no longer feels like pixel art — it's closer to a regular 2D game with large sprites. At 4x (480×270 with 16px tiles) individual pixels are fat and deliberate, which is the correct pixel art feel.

## Tradeoffs: 16px Tiles vs 32px Tiles

### 16px tiles (stay where we are)
Pros:
- 4x integer scale to 1080p — clean, crisp pixel art scaling
- 480×270 is an established, well-regarded indie pixel art resolution (Hyper Light Drifter)
- 30×17 grid gives good TD map depth
- Smaller resolution = faster to iterate on art
- Retro feel is authentic

Cons:
- 32×32 sprites displayed at 16px means sprites are 1:1 with tiles — no visual layering
- Fine detail in 16px tiles is near-invisible at 4x scale on a 1080p monitor (64px rendered tile)
- HUD elements at this resolution are very cramped (current issue: UI feels tiny)

**The fix is NOT to change tile size — it's to let sprites overhang their tile.** Towers should be rendered at 24–28px display size (1.5–1.75 tiles) so they visually rise above the ground. Enemies should similarly be 20–24px so they're clearly distinguishable from the path.

### 32px tiles (960×540)
Pros:
- Sprites have 4x more pixel detail per tile
- UI elements are naturally larger, more clickable on screen
- Easier to draw detailed tower art at 32px

Cons:
- 2x scale to 1080p is borderline — pixels look like "regular" 2D art, not pixel art
- Doubles the work for all existing art assets
- A 960×540 game is harder to run on low-end devices (4x the pixel fill)
- HUD strip at 270px height is already tight; 540px just adds empty space unless redesigned
- Breaks all existing coordinate/tile math throughout the codebase
- The entire level editor would need to be rebuilt for 32px tiles

## Recommendation: Stay at 16px Tiles, Fix the Sprite Sizing

The problem being considered (sprites look small/undistinguished) is a **display size issue, not a tile size issue**. The resolution and tile size choices are correct. The fix is:

1. **Let tower sprites visually overhang their tile.** Display towers at 24–26px (setDisplaySize), centered on the tile. This means they overlap adjacent tiles slightly, which is how every good tower defense game works — towers are taller than the ground they stand on.

2. **Display enemies at 20–24px** so they read clearly on the 16px path tiles.

3. **Keep 32×32 as the source texture size.** The 32×32 Spritey workflow stays intact; you just change `setDisplaySize` targets.

4. **Keep 480×270 / 4x to 1080p.** This is a correct and well-established choice.

The only legitimate reason to move to 32px tiles would be if the map needed to show much finer terrain detail (RPG-style maps with intricate multi-tile structures). Tower defense maps are mostly path + buildable terrain — 16px tiles are sufficient.

## Phaser 3 Specific Notes

- Current config (`pixelArt: true`, `roundPixels: true`, `Scale.FIT + CENTER_BOTH`) is correct.
- `pixelArt: true` sets nearest-neighbor filtering globally — no additional config needed.
- `roundPixels: true` prevents sub-pixel jitter during camera/sprite movement.
- Do NOT change `GAME_WIDTH`/`GAME_HEIGHT` — let `Scale.FIT` handle the rest.
- Sprite `setDisplaySize(w, h)` is the right tool to control visual size independently of texture size. No overhead, just a scale factor stored on the game object.
- If you want the camera to move without sub-pixel artifacts, ensure `camera.roundPixels = true` (Phaser sets this automatically when `pixelArt: true`).

## Sources Consulted

- [GameDev.net: 32x32 tiles vs 16x16 tiles](https://www.gamedev.net/forums/topic/379388-32x32-tiles-vs-16x16-tiles/)
- [Yacht Club Games: Breaking the NES (Shovel Knight)](https://www.yachtclubgames.com/blog/breaking-the-nes/)
- [shweep itch.io: Resolving Resolutions](https://shweep.itch.io/the-machine-that-breathes/devlog/114161/resolving-resolutions)
- [Saint11: Consistency in pixel art](https://saint11.art/blog/consistency/)
- [Unity Discussions: Pixel Art Game Resolution Options](https://discussions.unity.com/t/pixel-art-game-resolution-options/1597480)
- [GDevelop Forum: About resolution, pixel art and size](https://forum.gdevelop.io/t/about-resolution-pixel-art-and-size/48825)
- [Godot Forum: Tileset & Sprite Size](https://forum.godotengine.org/t/tileset-sprite-size/109162)
- [Phaser Discourse: Help with Scaling for Pixel Art](https://phaser.discourse.group/t/help-with-scaling-for-pixel-art/4782)
- [Photon Storm: Pixel Perfect Scaling a Phaser Game](https://photonstorm.com/phaser/pixel-perfect-scaling-a-phaser-game)
- [Unity Discussions: Pixel Perfect Resolution 320x180 or 320x192](https://discussions.unity.com/t/pixel-perfect-resolution-320x180-or-320x192/1683493)
