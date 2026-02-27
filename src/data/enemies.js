import { ENEMY_TYPES } from '../utils/constants.js';

// Base enemy stats (scaled per level/wave)
export const ENEMY_DATA = {
  [ENEMY_TYPES.GOBLIN]: {
    name: 'Goblin',
    hp: 30,
    speed: 35,
    gold: 5,
    damage: 1,
    sprite: 'enemy_goblin',
    isFlying: false,
    isStealth: false,
    abilities: [],
    size: 1,
  },

  [ENEMY_TYPES.WOLF_RIDER]: {
    name: 'Wolf Rider',
    hp: 20,
    speed: 60,
    gold: 8,
    damage: 1,
    sprite: 'enemy_wolf',
    isFlying: false,
    isStealth: false,
    abilities: [],
    size: 1,
  },

  [ENEMY_TYPES.TROLL]: {
    name: 'Troll',
    hp: 120,
    speed: 20,
    gold: 15,
    damage: 2,
    sprite: 'enemy_troll',
    isFlying: false,
    isStealth: false,
    abilities: ['regenerate'],
    regenRate: 2, // HP per second
    size: 1.25, // 1.25 × 32 = 40px (preserves old 2 × 20 = 40px)
  },

  [ENEMY_TYPES.HARPY]: {
    name: 'Harpy',
    hp: 35,
    speed: 45,
    gold: 10,
    damage: 1,
    sprite: 'enemy_harpy',
    isFlying: true,
    isStealth: false,
    abilities: [],
    size: 1,
  },

  [ENEMY_TYPES.WRAITH]: {
    name: 'Wraith',
    hp: 40,
    speed: 30,
    gold: 12,
    damage: 1,
    sprite: 'enemy_wraith',
    isFlying: false,
    isStealth: true,
    abilities: [],
    size: 1,
  },

  [ENEMY_TYPES.DARK_PRIEST]: {
    name: 'Dark Priest',
    hp: 50,
    speed: 25,
    gold: 14,
    damage: 1,
    sprite: 'enemy_priest',
    isFlying: false,
    isStealth: false,
    abilities: ['heal'],
    healAmount: 5,
    healRadius: 40,
    healRate: 2000, // ms between heals
    size: 1,
  },

  [ENEMY_TYPES.IMP]: {
    name: 'Imp',
    hp: 10,
    speed: 50,
    gold: 2,
    damage: 1,
    sprite: 'enemy_imp',
    isFlying: false,
    isStealth: false,
    abilities: [],
    size: 0.5, // 0.5 × 32 = 16px (preserves old 0.7 × 20 = 14px, rounded up)
  },

  [ENEMY_TYPES.DRAGON]: {
    name: 'Dragon',
    hp: 500,
    speed: 18,
    gold: 100,
    damage: 10,
    sprite: 'enemy_dragon',
    isFlying: true,
    isStealth: false,
    abilities: ['fireBreath'],
    isBoss: true,
    size: 1.9, // 1.9 × 32 ≈ 61px (preserves old 3 × 20 = 60px)
  },

  [ENEMY_TYPES.LICH]: {
    name: 'Lich King',
    hp: 800,
    speed: 15,
    gold: 150,
    damage: 15,
    sprite: 'enemy_lich',
    isFlying: false,
    isStealth: false,
    abilities: ['summon', 'shield'],
    isBoss: true,
    size: 1.6, // 1.6 × 32 ≈ 51px (preserves old 2.5 × 20 = 50px)
  },
};

// Get enemy stats scaled for a specific wave.
// customDefs: optional map of id→def for custom enemy types.
export function getScaledEnemyStats(type, waveNumber, customDefs = {}) {
  const base = customDefs[type] || ENEMY_DATA[type];
  if (!base) return null;
  const scale = 1 + (waveNumber - 1) * 0.12;
  return {
    ...base,
    hp: Math.floor(base.hp * scale),
    gold: Math.floor(base.gold * (1 + (waveNumber - 1) * 0.05)),
  };
}
