# Arcane Defenders — Current State & Roadmap

## What's Built

### Core game
- All 6 levels with maps, path auto-trace, waypoints, waves
- 6 tower types × 3 upgrade tiers (Arcane, Flame, Frost, Barracks, Lightning, Enchanter)
- 9 enemy types with scaling stats, status effects, flying/stealth/boss mechanics
- Economy (gold, lives, score), WaveManager, LeaderboardManager
- Game juice: screen shake, floating damage numbers, particles, range circles, path arrows
- Meteor active ability (45s cooldown)
- Speed toggle (1x / 2x), pause, level unlock via localStorage

### Level editor (`editor.html`)
- WYSIWYG map canvas (paint, erase, fill, waypoint tools)
- Tile palette, sprite library, wave editor, **monster editor**
- Auto-trace path from map tiles, test path animation, validate
- Load campaign levels, save/load JSON, export to clipboard, play in game
- Undo/redo history, autosave to localStorage

### Custom monster system
- Monster editor tab: define custom enemies with name, sprite, stats, traits, abilities
- Saved as `customEnemies[]` in level JSON alongside waves
- Custom monsters appear in wave editor dropdown under "Custom" group
- Fully playable — resolved through `customDefs` map at runtime
- Abilities supported: regenerate (HP/s), heal nearby (amount/radius/rate)

### Wave preview
- Before each wave: incoming enemy cards displayed bottom-left
- Each card: sprite icon + count (9px readable text), trait badges (~ flying, ? stealth), boss red tint
- Disappears on wave start, updates between waves

## Known gaps (not yet implemented)
- Dragon `fireBreath` ability — declared but not handled in Enemy.update()
- Lich `summon` + `shield` abilities — same
- Arcane tier-3 `piercing` — not in Projectile.hit()
- Flame tier-3 `inferno` — not implemented
- Barracks tier-3 `shield` — not implemented
- Healing Rain active ability — in design doc, not in GameScene

## Possible next work
- Implement missing tier-3 specials and boss abilities
- Balance pass across all 6 levels
- Custom Spritey art for enemies/towers
- More active abilities
- Sound effects
