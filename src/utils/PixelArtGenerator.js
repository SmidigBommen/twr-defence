import { COLORS, TILE_SIZE } from './constants.js';

// ── Outline color constants ──────────────────────────────
const OL = 0x1a1a2e;   // Standard dark outline
const OL2 = 0x0a0a1a;  // Extra-dark outline

// ── Drawing Helpers ──────────────────────────────────────

function oCircle(g, x, y, r, fill, outline) {
  outline = outline !== undefined ? outline : OL;
  g.fillStyle(outline);
  g.fillCircle(x, y, r + 1.5);
  g.fillStyle(fill);
  g.fillCircle(x, y, r);
}

function oRect(g, x, y, w, h, fill, outline) {
  outline = outline !== undefined ? outline : OL;
  g.fillStyle(outline);
  g.fillRect(x - 1, y - 1, w + 2, h + 2);
  g.fillStyle(fill);
  g.fillRect(x, y, w, h);
}

function oRRect(g, x, y, w, h, rad, fill, outline) {
  outline = outline !== undefined ? outline : OL;
  g.fillStyle(outline);
  g.fillRoundedRect(x - 1, y - 1, w + 2, h + 2, rad);
  g.fillStyle(fill);
  g.fillRoundedRect(x, y, w, h, rad);
}

function makeGfx(scene) {
  return scene.make.graphics({ x: 0, y: 0, add: false });
}

function gen(g, key, w, h) {
  g.generateTexture(key, w, h);
  g.destroy();
}

// ── Main Entry ───────────────────────────────────────────

export function generateTextures(scene) {
  generateTiles(scene);
  generateTowers(scene);
  generateEnemies(scene);
  generateProjectiles(scene);
  generateIcons(scene);
  generateParticles(scene);
}

// ══════════════════════════════════════════════════════════
// TILES (16x16)
// ══════════════════════════════════════════════════════════

function generateTiles(scene) {
  genTileGrass(scene);
  genTilePath(scene);
  genTileWater(scene);
  genTileTrees(scene, 'tile_trees', [[4, 3], [12, 10]]);
  genTileTrees(scene, 'tile_trees2', [[12, 3], [4, 10]]);
  genTileTrees(scene, 'tile_trees3', [[4, 5], [11, 5], [8, 11]]);
  genTileRocks(scene);
  genTileBuild(scene);
  genTileCastle(scene);
}

function genTileGrass(scene) {
  const g = makeGfx(scene);
  const S = 16;

  // Base grass fill
  g.fillStyle(0x3e8948);
  g.fillRect(0, 0, S, S);

  // Darker variation patches
  g.fillStyle(0x2d5a27);
  g.fillCircle(3, 5, 1.5);
  g.fillCircle(10, 2, 1);
  g.fillCircle(13, 11, 1.5);
  g.fillCircle(6, 13, 1);

  // Lighter grass highlights
  g.fillStyle(0x63c74d);
  g.fillCircle(7, 3, 1);
  g.fillCircle(2, 10, 1);
  g.fillCircle(12, 7, 1);
  g.fillCircle(5, 8, 0.5);

  // Tiny grass blade strokes
  g.lineStyle(1, 0x63c74d, 0.6);
  g.beginPath();
  g.moveTo(8, 12); g.lineTo(8, 10);
  g.moveTo(14, 5); g.lineTo(14, 3);
  g.moveTo(1, 14); g.lineTo(2, 12);
  g.strokePath();

  gen(g, 'tile_grass', S, S);
}

function genTilePath(scene) {
  const g = makeGfx(scene);
  const S = 16;

  // Base dirt tan
  g.fillStyle(0x8b6914);
  g.fillRect(0, 0, S, S);

  // Subtle darker edge border
  g.fillStyle(0x6b4226);
  g.fillRect(0, 0, S, 1);
  g.fillRect(0, S - 1, S, 1);
  g.fillRect(0, 0, 1, S);
  g.fillRect(S - 1, 0, 1, S);

  // Lighter dirt speckles
  g.fillStyle(0xb8860b);
  g.fillCircle(4, 4, 1);
  g.fillCircle(10, 8, 1);
  g.fillCircle(7, 12, 0.8);
  g.fillCircle(13, 3, 0.8);

  // Darker pebble speckles
  g.fillStyle(0x5a3a28);
  g.fillCircle(2, 9, 0.8);
  g.fillCircle(11, 13, 0.8);
  g.fillCircle(6, 6, 0.6);

  gen(g, 'tile_path', S, S);
}

function genTileWater(scene) {
  const g = makeGfx(scene);
  const S = 16;

  // Base blue
  g.fillStyle(0x0099db);
  g.fillRect(0, 0, S, S);

  // Darker deep water patches
  g.fillStyle(0x124e89);
  g.fillCircle(3, 8, 2);
  g.fillCircle(12, 3, 2);
  g.fillCircle(8, 13, 1.5);

  // Wave arcs (lighter blue)
  g.lineStyle(1, 0x2ce8f5, 0.5);
  g.beginPath();
  g.arc(5, 5, 3, Math.PI * 0.2, Math.PI * 0.8, false);
  g.strokePath();
  g.beginPath();
  g.arc(11, 10, 3, Math.PI * 0.2, Math.PI * 0.8, false);
  g.strokePath();

  // White sparkle dots
  g.fillStyle(0xffffff, 0.5);
  g.fillCircle(6, 3, 0.5);
  g.fillCircle(13, 9, 0.5);
  g.fillCircle(2, 13, 0.5);

  gen(g, 'tile_water', S, S);
}

function genTileTrees(scene, key, positions) {
  const g = makeGfx(scene);
  const S = 16;

  // Grass background
  g.fillStyle(0x3e8948);
  g.fillRect(0, 0, S, S);

  // Darker grass variation
  g.fillStyle(0x2d5a27);
  g.fillCircle(1, 14, 1);
  g.fillCircle(14, 1, 1);

  for (const [tx, ty] of positions) {
    // Trunk (outline then fill)
    g.fillStyle(OL);
    g.fillRect(tx - 1.5, ty + 1, 4, 5);
    g.fillStyle(0x5a3a28);
    g.fillRect(tx - 0.5, ty + 2, 2, 4);

    // Canopy cluster (3 overlapping circles with outline)
    g.fillStyle(OL);
    g.fillCircle(tx, ty - 1, 4);
    g.fillCircle(tx + 2, ty, 3.5);
    g.fillCircle(tx - 1, ty + 1, 3);

    g.fillStyle(0x265c42);
    g.fillCircle(tx, ty - 1, 3);
    g.fillCircle(tx + 2, ty, 2.5);
    g.fillCircle(tx - 1, ty + 1, 2);

    // Light highlight on canopy
    g.fillStyle(0x63c74d);
    g.fillCircle(tx - 1, ty - 2, 1);
  }

  gen(g, key, S, S);
}

function genTileRocks(scene) {
  const g = makeGfx(scene);
  const S = 16;

  // Stone base
  g.fillStyle(0x3a3a5c);
  g.fillRect(0, 0, S, S);

  // Rounded rock shapes with outlines
  oCircle(g, 5, 5, 3.5, 0x5a5a7a, 0x2a2a3c);
  oCircle(g, 11, 4, 2.5, 0x6a6a8a, 0x2a2a3c);
  oCircle(g, 8, 11, 3, 0x5a5a7a, 0x2a2a3c);
  oCircle(g, 13, 13, 2, 0x6a6a8a, 0x2a2a3c);

  // Highlight glints
  g.fillStyle(0x8a8aaa);
  g.fillCircle(4, 4, 1);
  g.fillCircle(10, 3, 0.8);
  g.fillCircle(7, 9.5, 1);

  gen(g, 'tile_rocks', S, S);
}

function genTileBuild(scene) {
  const g = makeGfx(scene);
  const S = 16;

  // Grass base
  g.fillStyle(0x3e8948);
  g.fillRect(0, 0, S, S);

  // Golden dashed border
  g.lineStyle(1, 0xffd700, 0.6);
  for (let i = 2; i < S - 2; i += 4) {
    g.beginPath();
    g.moveTo(i, 1); g.lineTo(i + 2, 1);
    g.moveTo(i, S - 2); g.lineTo(i + 2, S - 2);
    g.strokePath();
  }
  for (let i = 2; i < S - 2; i += 4) {
    g.beginPath();
    g.moveTo(1, i); g.lineTo(1, i + 2);
    g.moveTo(S - 2, i); g.lineTo(S - 2, i + 2);
    g.strokePath();
  }

  // Diamond center marker
  const c = S / 2;
  g.fillStyle(0xffd700, 0.5);
  g.fillTriangle(c, c - 2, c + 2, c, c, c + 2);
  g.fillTriangle(c, c - 2, c - 2, c, c, c + 2);

  gen(g, 'tile_build', S, S);
}

function genTileCastle(scene) {
  const g = makeGfx(scene);
  const S = 16;

  // Stone base
  g.fillStyle(0x3a3a5c);
  g.fillRect(0, 0, S, S);

  // Main wall
  oRect(g, 3, 4, 10, 12, 0x5a5a7a, 0x2a2a3c);

  // Left tower
  oRect(g, 1, 1, 4, 15, 0x6a6a8a, 0x2a2a3c);
  // Left crenellations
  g.fillStyle(0x7a7a9a);
  g.fillRect(1, 0, 1, 2);
  g.fillRect(3, 0, 1, 2);

  // Right tower
  oRect(g, 11, 1, 4, 15, 0x6a6a8a, 0x2a2a3c);
  // Right crenellations
  g.fillStyle(0x7a7a9a);
  g.fillRect(11, 0, 1, 2);
  g.fillRect(13, 0, 1, 2);

  // Arched doorway
  g.fillStyle(0x1a1a2e);
  g.fillRect(6, 10, 4, 6);
  g.fillCircle(8, 10, 2);
  // Door wood
  g.fillStyle(0x5a3a28);
  g.fillRect(7, 11, 2, 5);

  // Flag on right tower
  g.fillStyle(0xe74c3c);
  g.fillTriangle(13, 0, 15, 1, 13, 2);

  gen(g, 'tile_castle', S, S);
}

// ══════════════════════════════════════════════════════════
// TOWERS (24x24)
// ══════════════════════════════════════════════════════════

function generateTowers(scene) {
  genTowerArcane(scene);
  genTowerFlame(scene);
  genTowerFrost(scene);
  genTowerBarracks(scene);
  genTowerLightning(scene);
  genTowerEnchanter(scene);
}

function genTowerArcane(scene) {
  const g = makeGfx(scene);
  const S = 24;
  const cx = S / 2;

  // Stone pedestal
  oRRect(g, 6, 17, 12, 6, 2, 0x5a5a7a, OL);
  g.fillStyle(0x6a6a8a);
  g.fillRect(7, 17, 10, 1);

  // Crystal orb (purple)
  oCircle(g, cx, 11, 6, 0x7b2fbe, OL);

  // Inner glow
  g.fillStyle(0x9b59b6);
  g.fillCircle(cx - 1, 10, 3);

  // Cyan energy highlight
  g.fillStyle(0x2ce8f5);
  g.fillCircle(cx - 2, 9, 1.5);
  g.fillCircle(cx + 2, 12, 0.8);

  // White sparkle
  g.fillStyle(0xffffff);
  g.fillCircle(cx - 2, 8, 0.6);

  gen(g, 'tower_arcane', S, S);
}

function genTowerFlame(scene) {
  const g = makeGfx(scene);
  const S = 24;
  const cx = S / 2;

  // Stone pedestal
  oRRect(g, 6, 18, 12, 5, 2, 0x5a5a7a, OL);

  // Bowl / brazier
  oRRect(g, 7, 13, 10, 6, 2, 0x7f8c8d, OL);
  // Bowl inner shadow
  g.fillStyle(0x4a4a6a);
  g.fillRoundedRect(8, 14, 8, 3, 1);

  // Flames - layered triangles for depth
  // Outer orange flame
  g.fillStyle(OL);
  g.fillTriangle(cx, 2, cx - 5, 14, cx + 5, 14);
  g.fillStyle(0xff6b35);
  g.fillTriangle(cx, 3, cx - 4, 13, cx + 4, 13);

  // Side flame licks
  g.fillStyle(0xe67e22);
  g.fillTriangle(cx - 3, 5, cx - 5, 13, cx - 1, 13);
  g.fillTriangle(cx + 3, 5, cx + 1, 13, cx + 5, 13);

  // Inner yellow flame
  g.fillStyle(0xf1c40f);
  g.fillTriangle(cx, 5, cx - 2.5, 13, cx + 2.5, 13);

  // White-hot center
  g.fillStyle(0xffffff);
  g.fillTriangle(cx, 8, cx - 1, 13, cx + 1, 13);

  gen(g, 'tower_flame', S, S);
}

function genTowerFrost(scene) {
  const g = makeGfx(scene);
  const S = 24;
  const cx = S / 2;

  // Stone base
  oRRect(g, 6, 18, 12, 5, 2, 0x5a5a7a, OL);

  // Ice spire (triangular)
  g.fillStyle(OL);
  g.fillTriangle(cx, 1, cx - 6, 19, cx + 6, 19);
  g.fillStyle(0x85c1e9);
  g.fillTriangle(cx, 2, cx - 5, 18, cx + 5, 18);

  // White ice highlight facet
  g.fillStyle(0xdce6f0);
  g.fillTriangle(cx - 1, 5, cx - 4, 16, cx, 16);

  // Bright highlight
  g.fillStyle(0xffffff);
  g.fillTriangle(cx - 1, 7, cx - 3, 14, cx, 14);

  // Small side crystals
  g.fillStyle(0x85c1e9);
  g.fillTriangle(cx - 4, 14, cx - 7, 18, cx - 3, 18);
  g.fillTriangle(cx + 4, 14, cx + 3, 18, cx + 7, 18);

  gen(g, 'tower_frost', S, S);
}

function genTowerBarracks(scene) {
  const g = makeGfx(scene);
  const S = 24;
  const cx = S / 2;

  // Building walls
  oRRect(g, 4, 9, 16, 14, 2, 0x7f8c8d, OL);
  // Lighter wall highlight
  g.fillStyle(0x95a5a6);
  g.fillRect(5, 9, 14, 2);

  // Roof (dark triangular)
  g.fillStyle(OL);
  g.fillTriangle(cx, 1, 2, 11, S - 2, 11);
  g.fillStyle(0x4a4a6a);
  g.fillTriangle(cx, 2, 3, 10, S - 3, 10);
  // Roof left-face highlight
  g.fillStyle(0x5a5a7a);
  g.fillTriangle(cx, 3, 4, 10, cx, 10);

  // Door (arched top)
  g.fillStyle(0x5a3a28);
  g.fillRect(9, 17, 6, 6);
  g.fillCircle(cx, 17, 3);
  // Door divider
  g.fillStyle(OL);
  g.fillRect(cx - 0.5, 17, 1, 6);

  // Shield emblem on wall
  g.fillStyle(OL);
  g.fillCircle(cx, 14, 2.5);
  g.fillStyle(0xbdc3c7);
  g.fillCircle(cx, 14, 1.8);
  g.fillStyle(0xe74c3c);
  g.fillRect(cx - 0.5, 13, 1, 2.5);

  gen(g, 'tower_barracks', S, S);
}

function genTowerLightning(scene) {
  const g = makeGfx(scene);
  const S = 24;
  const cx = S / 2;

  // Stone base / pedestal
  oRRect(g, 6, 18, 12, 5, 2, 0x5a5a7a, OL);
  oRRect(g, 8, 15, 8, 4, 1, 0x6a6a8a, OL);

  // Pylon body (tall tapered)
  g.fillStyle(OL);
  g.fillTriangle(cx, 6, cx - 4, 16, cx + 4, 16);
  g.fillStyle(0x6a6a8a);
  g.fillTriangle(cx, 7, cx - 3, 15, cx + 3, 15);

  // Glowing orb at top
  oCircle(g, cx, 5, 4, 0xf1c40f, OL);
  // Inner bright yellow
  g.fillStyle(0xffeaa7);
  g.fillCircle(cx, 4, 2);
  // White-hot center
  g.fillStyle(0xffffff);
  g.fillCircle(cx - 0.5, 3.5, 0.8);

  // Blue energy accents on pylon
  g.fillStyle(0x3498db);
  g.fillCircle(cx, 10, 1.2);
  g.fillCircle(cx, 13, 1);

  gen(g, 'tower_lightning', S, S);
}

function genTowerEnchanter(scene) {
  const g = makeGfx(scene);
  const S = 24;
  const cx = S / 2;

  // Brown base
  oRRect(g, 7, 19, 10, 4, 2, 0x5a3a28, OL);

  // Obelisk body (tapered polygon)
  g.fillStyle(OL);
  g.beginPath();
  g.moveTo(cx - 2, 3);
  g.lineTo(cx + 2, 3);
  g.lineTo(cx + 4, 20);
  g.lineTo(cx - 4, 20);
  g.closePath();
  g.fillPath();

  g.fillStyle(0x27ae60);
  g.beginPath();
  g.moveTo(cx - 1.5, 4);
  g.lineTo(cx + 1.5, 4);
  g.lineTo(cx + 3, 19);
  g.lineTo(cx - 3, 19);
  g.closePath();
  g.fillPath();

  // Gold cap at top
  g.fillStyle(0xffd700);
  g.fillTriangle(cx, 2, cx - 2.5, 5, cx + 2.5, 5);

  // Diamond rune in center
  g.fillStyle(0xffd700);
  g.fillTriangle(cx, 9, cx - 2, 12, cx, 15);
  g.fillTriangle(cx, 9, cx + 2, 12, cx, 15);
  // Inner rune highlight
  g.fillStyle(0xffeaa7);
  g.fillTriangle(cx, 10, cx - 1, 12, cx, 14);

  // Green glow dots
  g.fillStyle(0x55efc4);
  g.fillCircle(cx, 7, 0.8);
  g.fillCircle(cx, 17, 0.8);

  gen(g, 'tower_enchanter', S, S);
}

// ══════════════════════════════════════════════════════════
// ENEMIES (20x20)
// ══════════════════════════════════════════════════════════

function generateEnemies(scene) {
  genEnemyGoblin(scene);
  genEnemyWolf(scene);
  genEnemyTroll(scene);
  genEnemyHarpy(scene);
  genEnemyWraith(scene);
  genEnemyPriest(scene);
  genEnemyImp(scene);
  genEnemyDragon(scene);
  genEnemyLich(scene);
}

function genEnemyGoblin(scene) {
  const g = makeGfx(scene);
  const S = 20;
  const cx = S / 2;

  // Body / tunic
  oRRect(g, 7, 11, 6, 6, 2, 0x5a3a28, OL);

  // Head (round green)
  oCircle(g, cx, 7, 5, 0x4a8c3f, OL);

  // Pointed ears
  g.fillStyle(OL);
  g.fillTriangle(cx - 6, 6, cx - 3, 3, cx - 3, 8);
  g.fillTriangle(cx + 6, 6, cx + 3, 3, cx + 3, 8);
  g.fillStyle(0x4a8c3f);
  g.fillTriangle(cx - 5.5, 6, cx - 3.5, 3.5, cx - 3.5, 7.5);
  g.fillTriangle(cx + 5.5, 6, cx + 3.5, 3.5, cx + 3.5, 7.5);

  // Eyes
  g.fillStyle(0x0a0a1a);
  g.fillCircle(cx - 2, 6, 1.2);
  g.fillCircle(cx + 2, 6, 1.2);
  // Eye glints
  g.fillStyle(0xffffff);
  g.fillCircle(cx - 2.3, 5.5, 0.3);
  g.fillCircle(cx + 1.7, 5.5, 0.3);

  // Wide grin
  g.lineStyle(1, 0x2d5a27);
  g.beginPath();
  g.arc(cx, 8.5, 2, 0.2, Math.PI - 0.2, false);
  g.strokePath();

  // Legs
  oRect(g, 7, 16, 2, 3, 0x3e8948, OL);
  oRect(g, 11, 16, 2, 3, 0x3e8948, OL);

  gen(g, 'enemy_goblin', S, S);
}

function genEnemyWolf(scene) {
  const g = makeGfx(scene);
  const S = 20;

  // Body (horizontal oval)
  g.fillStyle(OL);
  g.fillEllipse(10, 10, 16, 8);
  g.fillStyle(0x7f8c8d);
  g.fillEllipse(10, 10, 14, 6);

  // Head
  oCircle(g, 4, 7, 3.5, 0x95a5a6, OL);

  // Pointed ears
  g.fillStyle(OL);
  g.fillTriangle(2, 3, 3, 0, 5, 4);
  g.fillTriangle(5, 3, 5, 0, 7, 4);
  g.fillStyle(0x95a5a6);
  g.fillTriangle(2.5, 3.5, 3.3, 1, 4.5, 4);
  g.fillTriangle(5.5, 3.5, 5.3, 1, 6.5, 4);

  // Eye
  g.fillStyle(0x0a0a1a);
  g.fillCircle(3, 6.5, 1);
  g.fillStyle(0xe74c3c);
  g.fillCircle(2.7, 6.2, 0.3);

  // Snout
  g.fillStyle(0xbdc3c7);
  g.fillCircle(2, 8.5, 1.2);
  g.fillStyle(0x0a0a1a);
  g.fillCircle(1.5, 8.3, 0.5);

  // Tail
  g.lineStyle(2, OL);
  g.beginPath();
  g.moveTo(17, 9);
  g.lineTo(19, 6);
  g.strokePath();
  g.lineStyle(1.5, 0x7f8c8d);
  g.beginPath();
  g.moveTo(17, 9);
  g.lineTo(19, 6);
  g.strokePath();

  // Legs (4)
  g.fillStyle(OL);
  g.fillRect(4, 13, 2, 5);
  g.fillRect(7, 13, 2, 5);
  g.fillRect(12, 13, 2, 5);
  g.fillRect(15, 13, 2, 5);
  g.fillStyle(0x7f8c8d);
  g.fillRect(4.5, 13, 1.5, 4);
  g.fillRect(7.5, 13, 1.5, 4);
  g.fillRect(12.5, 13, 1.5, 4);
  g.fillRect(15.5, 13, 1.5, 4);

  gen(g, 'enemy_wolf', S, S);
}

function genEnemyTroll(scene) {
  const g = makeGfx(scene);
  const S = 20;
  const cx = S / 2;

  // Thick legs
  oRect(g, 5, 15, 4, 5, 0x2d5a27, OL);
  oRect(g, 11, 15, 4, 5, 0x2d5a27, OL);

  // Large body
  oRRect(g, 4, 7, 12, 10, 3, 0x2d5a27, OL);

  // Thick arms
  oRect(g, 1, 9, 3, 7, 0x2d5a27, OL);
  oRect(g, 16, 9, 3, 7, 0x2d5a27, OL);

  // Head
  oCircle(g, cx, 5, 4.5, 0x3e8948, OL);

  // Angry yellow eyes
  g.fillStyle(0xf1c40f);
  g.fillCircle(cx - 2, 4.5, 1.2);
  g.fillCircle(cx + 2, 4.5, 1.2);
  g.fillStyle(0x0a0a1a);
  g.fillCircle(cx - 2, 4.5, 0.5);
  g.fillCircle(cx + 2, 4.5, 0.5);

  // Angry brow line
  g.lineStyle(1.5, OL);
  g.beginPath();
  g.moveTo(cx - 4, 3);
  g.lineTo(cx - 1, 3.5);
  g.moveTo(cx + 4, 3);
  g.lineTo(cx + 1, 3.5);
  g.strokePath();

  // Wide mouth with teeth
  g.fillStyle(0x1a1a2e);
  g.fillRect(cx - 3, 7, 6, 2);
  g.fillStyle(0xecf0f1);
  g.fillTriangle(cx - 2, 7, cx - 1, 8.5, cx, 7);
  g.fillTriangle(cx + 2, 7, cx + 1, 8.5, cx, 7);

  gen(g, 'enemy_troll', S, S);
}

function genEnemyHarpy(scene) {
  const g = makeGfx(scene);
  const S = 20;
  const cx = S / 2;

  // Left wing
  g.fillStyle(OL);
  g.fillTriangle(0, 5, cx - 2, 7, cx - 2, 14);
  g.fillStyle(0x8e44ad);
  g.fillTriangle(1, 6, cx - 2, 8, cx - 2, 13);
  // Feather tips
  g.fillStyle(0x6c3483);
  g.fillTriangle(0, 5, 2, 8, 4, 7);
  g.fillTriangle(1, 7, 3, 10, 5, 8);

  // Right wing
  g.fillStyle(OL);
  g.fillTriangle(S, 5, cx + 2, 7, cx + 2, 14);
  g.fillStyle(0x8e44ad);
  g.fillTriangle(S - 1, 6, cx + 2, 8, cx + 2, 13);
  g.fillStyle(0x6c3483);
  g.fillTriangle(S, 5, S - 2, 8, S - 4, 7);
  g.fillTriangle(S - 1, 7, S - 3, 10, S - 5, 8);

  // Body (torso)
  oRRect(g, 7, 8, 6, 8, 2, 0x8e44ad, OL);

  // Head
  oCircle(g, cx, 5, 3.5, 0xffcc99, OL);

  // Eyes
  g.fillStyle(0x0a0a1a);
  g.fillCircle(cx - 1.2, 4.5, 0.8);
  g.fillCircle(cx + 1.2, 4.5, 0.8);

  // Hair (purple)
  g.fillStyle(0x6c3483);
  g.fillCircle(cx - 1, 2.5, 1.5);
  g.fillCircle(cx + 1, 2.5, 1.5);
  g.fillCircle(cx, 2, 1.5);

  // Talons / legs
  g.lineStyle(1.5, OL);
  g.beginPath();
  g.moveTo(cx - 2, 16);
  g.lineTo(cx - 3, 19);
  g.moveTo(cx + 2, 16);
  g.lineTo(cx + 3, 19);
  g.strokePath();
  g.lineStyle(1, 0xf39c12);
  g.beginPath();
  g.moveTo(cx - 2, 16);
  g.lineTo(cx - 3, 19);
  g.moveTo(cx + 2, 16);
  g.lineTo(cx + 3, 19);
  g.strokePath();

  gen(g, 'enemy_harpy', S, S);
}

function genEnemyWraith(scene) {
  const g = makeGfx(scene);
  const S = 20;
  const cx = S / 2;

  // Hood / pointed top
  g.fillStyle(OL);
  g.fillTriangle(cx, 0, cx - 5, 8, cx + 5, 8);
  g.fillStyle(0x85c1e9);
  g.fillTriangle(cx, 1, cx - 4, 7, cx + 4, 7);

  // Face area (dark void)
  g.fillStyle(0x1a1a2e);
  g.fillCircle(cx, 6, 2.5);

  // Glowing eyes
  g.fillStyle(0x2ce8f5);
  g.fillCircle(cx - 1.5, 5.5, 0.8);
  g.fillCircle(cx + 1.5, 5.5, 0.8);
  g.fillStyle(0xffffff);
  g.fillCircle(cx - 1.5, 5.5, 0.3);
  g.fillCircle(cx + 1.5, 5.5, 0.3);

  // Flowing robe body
  g.fillStyle(OL);
  g.beginPath();
  g.moveTo(cx - 5, 7);
  g.lineTo(cx + 5, 7);
  g.lineTo(cx + 6, 16);
  g.lineTo(cx - 6, 16);
  g.closePath();
  g.fillPath();

  g.fillStyle(0x85c1e9);
  g.beginPath();
  g.moveTo(cx - 4, 8);
  g.lineTo(cx + 4, 8);
  g.lineTo(cx + 5, 15);
  g.lineTo(cx - 5, 15);
  g.closePath();
  g.fillPath();

  // Zigzag bottom edge (tattered)
  g.fillStyle(0x85c1e9);
  for (let i = -5; i < 5; i += 2) {
    g.fillTriangle(cx + i, 15, cx + i + 2, 15, cx + i + 1, 19);
  }

  // Lighter robe center highlight
  g.fillStyle(0xa8d8ea, 0.5);
  g.fillRect(cx - 1, 9, 2, 6);

  gen(g, 'enemy_wraith', S, S);
}

function genEnemyPriest(scene) {
  const g = makeGfx(scene);
  const S = 20;
  const cx = S / 2 - 1;

  // Robe body
  g.fillStyle(OL);
  g.beginPath();
  g.moveTo(cx - 4, 8);
  g.lineTo(cx + 4, 8);
  g.lineTo(cx + 5, 19);
  g.lineTo(cx - 5, 19);
  g.closePath();
  g.fillPath();

  g.fillStyle(0x8b1a1a);
  g.beginPath();
  g.moveTo(cx - 3, 9);
  g.lineTo(cx + 3, 9);
  g.lineTo(cx + 4, 18);
  g.lineTo(cx - 4, 18);
  g.closePath();
  g.fillPath();

  // Hood
  g.fillStyle(0x8b1a1a);
  g.fillCircle(cx, 4, 4);

  // Head / face
  oCircle(g, cx, 5.5, 2.8, 0xffcc99, OL);

  // Eyes
  g.fillStyle(0x0a0a1a);
  g.fillCircle(cx - 1, 5.2, 0.6);
  g.fillCircle(cx + 1, 5.2, 0.6);

  // Robe center sash
  g.fillStyle(0xc0392b);
  g.fillRect(cx - 0.5, 9, 1, 9);

  // Staff (right side)
  const sx = cx + 7;
  g.lineStyle(2, OL);
  g.beginPath();
  g.moveTo(sx, 3);
  g.lineTo(sx, 19);
  g.strokePath();
  g.lineStyle(1.5, 0x5a3a28);
  g.beginPath();
  g.moveTo(sx, 3);
  g.lineTo(sx, 19);
  g.strokePath();

  // Staff orb
  oCircle(g, sx, 3, 2.5, 0xe74c3c, OL);
  g.fillStyle(0xff6b6b);
  g.fillCircle(sx - 0.5, 2.5, 0.8);

  gen(g, 'enemy_priest', S, S);
}

function genEnemyImp(scene) {
  const g = makeGfx(scene);
  const S = 20;
  const cx = S / 2;

  // Small body
  oCircle(g, cx, 12, 3.5, 0xc0392b, OL);

  // Head
  oCircle(g, cx, 7, 3.5, 0xe74c3c, OL);

  // Horns
  g.fillStyle(OL);
  g.fillTriangle(cx - 3, 5, cx - 5, 1, cx - 1, 5);
  g.fillTriangle(cx + 3, 5, cx + 5, 1, cx + 1, 5);
  g.fillStyle(0x8b1a1a);
  g.fillTriangle(cx - 3, 5, cx - 4.5, 2, cx - 1.5, 5);
  g.fillTriangle(cx + 3, 5, cx + 4.5, 2, cx + 1.5, 5);

  // Yellow menacing eyes
  g.fillStyle(0xf1c40f);
  g.fillCircle(cx - 1.2, 6.5, 1);
  g.fillCircle(cx + 1.2, 6.5, 1);
  g.fillStyle(0x0a0a1a);
  g.fillCircle(cx - 1.2, 6.5, 0.4);
  g.fillCircle(cx + 1.2, 6.5, 0.4);

  // Grin
  g.lineStyle(1, 0x0a0a1a);
  g.beginPath();
  g.arc(cx, 8.5, 1.5, 0.1, Math.PI - 0.1, false);
  g.strokePath();

  // Tiny bat wings
  g.fillStyle(OL);
  g.fillTriangle(cx - 4, 10, cx - 8, 7, cx - 3, 13);
  g.fillTriangle(cx + 4, 10, cx + 8, 7, cx + 3, 13);
  g.fillStyle(0x8b1a1a);
  g.fillTriangle(cx - 4, 10.5, cx - 7, 8, cx - 3.5, 12.5);
  g.fillTriangle(cx + 4, 10.5, cx + 7, 8, cx + 3.5, 12.5);

  // Legs
  oRect(g, cx - 3, 15, 2, 4, 0xc0392b, OL);
  oRect(g, cx + 1, 15, 2, 4, 0xc0392b, OL);

  // Pointed tail
  g.lineStyle(1.5, OL);
  g.beginPath();
  g.moveTo(cx + 3, 13);
  g.lineTo(cx + 7, 14);
  g.lineTo(cx + 8, 12);
  g.strokePath();
  g.lineStyle(1, 0xc0392b);
  g.beginPath();
  g.moveTo(cx + 3, 13);
  g.lineTo(cx + 7, 14);
  g.lineTo(cx + 8, 12);
  g.strokePath();

  gen(g, 'enemy_imp', S, S);
}

function genEnemyDragon(scene) {
  const g = makeGfx(scene);
  const S = 20;
  const cx = S / 2;

  // Left wing
  g.fillStyle(OL);
  g.fillTriangle(0, 5, cx - 2, 7, cx - 2, 15);
  g.fillStyle(0xc0392b);
  g.fillTriangle(1, 6, cx - 2, 8, cx - 2, 14);
  g.fillStyle(0x8b0000);
  g.fillTriangle(1, 6, 3, 9, 5, 7);

  // Right wing
  g.fillStyle(OL);
  g.fillTriangle(S, 5, cx + 2, 7, cx + 2, 15);
  g.fillStyle(0xc0392b);
  g.fillTriangle(S - 1, 6, cx + 2, 8, cx + 2, 14);
  g.fillStyle(0x8b0000);
  g.fillTriangle(S - 1, 6, S - 3, 9, S - 5, 7);

  // Body
  oRRect(g, 6, 8, 8, 8, 3, 0x8b0000, OL);
  // Belly
  g.fillStyle(0xe67e22);
  g.fillRoundedRect(8, 10, 4, 4, 1);

  // Head
  oCircle(g, cx, 6, 4, 0xc0392b, OL);

  // Horns
  g.fillStyle(OL);
  g.fillTriangle(cx - 3, 4, cx - 5, 0, cx - 1, 4);
  g.fillTriangle(cx + 3, 4, cx + 5, 0, cx + 1, 4);
  g.fillStyle(0x5a3a28);
  g.fillTriangle(cx - 3, 4, cx - 4.5, 1, cx - 1.5, 4);
  g.fillTriangle(cx + 3, 4, cx + 4.5, 1, cx + 1.5, 4);

  // Fierce eyes
  g.fillStyle(0xf1c40f);
  g.fillCircle(cx - 1.5, 5.5, 1.2);
  g.fillCircle(cx + 1.5, 5.5, 1.2);
  g.fillStyle(0x0a0a1a);
  g.fillCircle(cx - 1.5, 5.5, 0.5);
  g.fillCircle(cx + 1.5, 5.5, 0.5);

  // Nostrils (fire glow)
  g.fillStyle(0xff6b35);
  g.fillCircle(cx - 1, 8, 0.5);
  g.fillCircle(cx + 1, 8, 0.5);

  // Legs
  oRect(g, 6, 15, 3, 4, 0x8b0000, OL);
  oRect(g, 11, 15, 3, 4, 0x8b0000, OL);

  gen(g, 'enemy_dragon', S, S);
}

function genEnemyLich(scene) {
  const g = makeGfx(scene);
  const S = 20;
  const cx = S / 2 - 1;

  // Robe body (flowing purple)
  g.fillStyle(OL);
  g.beginPath();
  g.moveTo(cx - 5, 8);
  g.lineTo(cx + 5, 8);
  g.lineTo(cx + 6, 19);
  g.lineTo(cx - 6, 19);
  g.closePath();
  g.fillPath();

  g.fillStyle(0x6c3483);
  g.beginPath();
  g.moveTo(cx - 4, 9);
  g.lineTo(cx + 4, 9);
  g.lineTo(cx + 5, 18);
  g.lineTo(cx - 5, 18);
  g.closePath();
  g.fillPath();

  // Robe center highlight
  g.fillStyle(0x8e44ad);
  g.fillRect(cx - 1, 10, 2, 8);

  // Skull head
  oCircle(g, cx, 6, 4, 0xbdc3c7, OL);
  g.fillStyle(0xecf0f1);
  g.fillCircle(cx, 6, 3);

  // Glowing cyan eyes
  g.fillStyle(0x0a0a1a);
  g.fillCircle(cx - 1.5, 5.5, 1.2);
  g.fillCircle(cx + 1.5, 5.5, 1.2);
  g.fillStyle(0x2ce8f5);
  g.fillCircle(cx - 1.5, 5.5, 0.8);
  g.fillCircle(cx + 1.5, 5.5, 0.8);

  // Skull mouth
  g.fillStyle(0x0a0a1a);
  g.fillRect(cx - 1.5, 8, 3, 1);

  // Gold crown
  g.fillStyle(0xffd700);
  g.fillRect(cx - 3.5, 2, 7, 2);
  // Crown points
  g.fillTriangle(cx - 3, 2, cx - 2, 0.5, cx - 1, 2);
  g.fillTriangle(cx - 0.5, 2, cx, 0, cx + 0.5, 2);
  g.fillTriangle(cx + 1, 2, cx + 2, 0.5, cx + 3, 2);

  // Staff (right side)
  const sx = cx + 8;
  g.lineStyle(2, OL);
  g.beginPath();
  g.moveTo(sx, 2);
  g.lineTo(sx, 19);
  g.strokePath();
  g.lineStyle(1.5, 0x5a3a28);
  g.beginPath();
  g.moveTo(sx, 2);
  g.lineTo(sx, 19);
  g.strokePath();

  // Staff orb (cyan glow)
  oCircle(g, sx, 2, 2.5, 0x2ce8f5, OL);
  g.fillStyle(0xffffff);
  g.fillCircle(sx - 0.5, 1.5, 0.6);

  gen(g, 'enemy_lich', S, S);
}

// ══════════════════════════════════════════════════════════
// PROJECTILES (8x8)
// ══════════════════════════════════════════════════════════

function generateProjectiles(scene) {
  genProjArcane(scene);
  genProjFlame(scene);
  genProjFrost(scene);
  genProjLightning(scene);
}

function genProjArcane(scene) {
  const g = makeGfx(scene);
  const S = 8;
  const c = S / 2;

  // Purple circle with cyan center
  oCircle(g, c, c, 3, 0x7b2fbe, OL);
  g.fillStyle(0x2ce8f5);
  g.fillCircle(c, c, 1.5);
  g.fillStyle(0xffffff);
  g.fillCircle(c - 0.5, c - 0.5, 0.5);

  gen(g, 'proj_arcane', S, S);
}

function genProjFlame(scene) {
  const g = makeGfx(scene);
  const S = 8;
  const c = S / 2;

  // Orange glowing circle
  oCircle(g, c, c, 3, 0xff6b35, 0x8b1a1a);
  g.fillStyle(0xf1c40f);
  g.fillCircle(c, c, 1.5);
  g.fillStyle(0xffffff);
  g.fillCircle(c - 0.3, c - 0.3, 0.5);

  gen(g, 'proj_flame', S, S);
}

function genProjFrost(scene) {
  const g = makeGfx(scene);
  const S = 8;
  const c = S / 2;

  // Light blue diamond
  g.fillStyle(OL);
  g.fillTriangle(c, 0, S, c, c, S);
  g.fillTriangle(c, 0, 0, c, c, S);
  g.fillStyle(0x85c1e9);
  g.fillTriangle(c, 1, S - 1, c, c, S - 1);
  g.fillTriangle(c, 1, 1, c, c, S - 1);

  // White center
  g.fillStyle(0xffffff);
  g.fillCircle(c, c, 1);

  gen(g, 'proj_frost', S, S);
}

function genProjLightning(scene) {
  const g = makeGfx(scene);
  const S = 8;
  const c = S / 2;

  // Yellow 4-pointed star
  g.fillStyle(OL);
  g.fillTriangle(c, 0, c - 1.5, c, c + 1.5, c);
  g.fillTriangle(c, S, c - 1.5, c, c + 1.5, c);
  g.fillTriangle(0, c, c, c - 1.5, c, c + 1.5);
  g.fillTriangle(S, c, c, c - 1.5, c, c + 1.5);

  g.fillStyle(0xf1c40f);
  g.fillTriangle(c, 0.5, c - 1, c, c + 1, c);
  g.fillTriangle(c, S - 0.5, c - 1, c, c + 1, c);
  g.fillTriangle(0.5, c, c, c - 1, c, c + 1);
  g.fillTriangle(S - 0.5, c, c, c - 1, c, c + 1);

  // White-hot center
  g.fillStyle(0xffffff);
  g.fillCircle(c, c, 1);

  gen(g, 'proj_lightning', S, S);
}

// ══════════════════════════════════════════════════════════
// UI ICONS (12x12)
// ══════════════════════════════════════════════════════════

function generateIcons(scene) {
  genIconHeart(scene);
  genIconCoin(scene);
}

function genIconHeart(scene) {
  const g = makeGfx(scene);
  const S = 12;
  const cx = S / 2;

  // Heart: two circles + triangle
  g.fillStyle(OL);
  g.fillCircle(cx - 2, 4, 3.5);
  g.fillCircle(cx + 2, 4, 3.5);
  g.fillTriangle(cx - 5, 5, cx + 5, 5, cx, 11);

  g.fillStyle(0xe74c3c);
  g.fillCircle(cx - 2, 4, 2.5);
  g.fillCircle(cx + 2, 4, 2.5);
  g.fillTriangle(cx - 4, 5, cx + 4, 5, cx, 10);

  // Highlight
  g.fillStyle(0xff6b6b);
  g.fillCircle(cx - 2, 3.5, 1);

  gen(g, 'icon_heart', S, S);
}

function genIconCoin(scene) {
  const g = makeGfx(scene);
  const S = 12;
  const cx = S / 2;
  const cy = S / 2;

  // Gold coin
  oCircle(g, cx, cy, 5, 0xffd700, OL);

  // Inner ring
  g.lineStyle(0.5, 0xb8860b);
  g.strokeCircle(cx, cy, 3.5);

  // $ symbol center
  g.fillStyle(0xb8860b);
  g.fillRect(cx - 0.5, cy - 2, 1, 4);
  g.fillRect(cx - 1.5, cy - 1, 3, 1);
  g.fillRect(cx - 1.5, cy + 0.5, 3, 1);

  // Highlight
  g.fillStyle(0xffeaa7);
  g.fillCircle(cx - 1.5, cy - 1.5, 1);

  gen(g, 'icon_coin', S, S);
}

// ══════════════════════════════════════════════════════════
// PARTICLES (circles - unchanged from original)
// ══════════════════════════════════════════════════════════

function generateParticles(scene) {
  generateCircleTexture(scene, 'particle_magic', 3, 0xbb6bd9);
  generateCircleTexture(scene, 'particle_fire', 3, 0xff6b35);
  generateCircleTexture(scene, 'particle_ice', 3, 0x74b9ff);
  generateCircleTexture(scene, 'particle_lightning', 2, 0xffeaa7);
  generateCircleTexture(scene, 'particle_heal', 3, 0x55efc4);
  generateCircleTexture(scene, 'particle_death', 2, 0xecf0f1);
  generateCircleTexture(scene, 'particle_gold', 2, 0xffd700);
  generateCircleTexture(scene, 'range_circle', 1, 0xffffff);
}

function generateCircleTexture(scene, key, radius, color) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(color, 1);
  g.fillCircle(radius, radius, radius);
  g.generateTexture(key, radius * 2, radius * 2);
  g.destroy();
}
