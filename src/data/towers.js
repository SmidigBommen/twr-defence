import { TOWER_TYPES, TARGET_MODE, STATUS } from '../utils/constants.js';

// Tower definitions with stats per upgrade level (0 = base, 1-2 = upgrades)
export const TOWER_DATA = {
  [TOWER_TYPES.ARCANE]: {
    name: 'Arcane Turret',
    description: 'Rapid fire magic bolts',
    icon: 'tower_arcane',
    cost: 50,
    targetMode: TARGET_MODE.FIRST,
    canTargetFlying: true,
    levels: [
      { damage: 8, range: 80, fireRate: 600, special: null },
      { damage: 14, range: 90, fireRate: 500, special: null, upgradeCost: 40 },
      { damage: 22, range: 100, fireRate: 400, special: 'piercing', upgradeCost: 80 },
    ],
    projectile: 'proj_arcane',
    projectileSpeed: 200,
  },

  [TOWER_TYPES.FLAME]: {
    name: 'Flame Brazier',
    description: 'AoE fire with burn damage',
    icon: 'tower_flame',
    cost: 75,
    targetMode: TARGET_MODE.NEAREST,
    canTargetFlying: false,
    levels: [
      { damage: 12, range: 70, fireRate: 1200, splashRadius: 24, burnDamage: 3, burnDuration: 2000, special: null },
      { damage: 20, range: 75, fireRate: 1000, splashRadius: 30, burnDamage: 5, burnDuration: 2500, special: null, upgradeCost: 50 },
      { damage: 30, range: 85, fireRate: 800, splashRadius: 36, burnDamage: 8, burnDuration: 3000, special: 'inferno', upgradeCost: 100 },
    ],
    projectile: 'proj_flame',
    projectileSpeed: 150,
  },

  [TOWER_TYPES.FROST]: {
    name: 'Frost Spire',
    description: 'Slows and freezes enemies',
    icon: 'tower_frost',
    cost: 60,
    targetMode: TARGET_MODE.FIRST,
    canTargetFlying: true,
    levels: [
      { damage: 5, range: 75, fireRate: 800, slowAmount: 0.3, slowDuration: 1500, special: null },
      { damage: 8, range: 85, fireRate: 700, slowAmount: 0.4, slowDuration: 2000, special: null, upgradeCost: 45 },
      { damage: 12, range: 95, fireRate: 600, slowAmount: 0.5, slowDuration: 2500, special: 'freeze', upgradeCost: 90 },
    ],
    projectile: 'proj_frost',
    projectileSpeed: 180,
  },

  [TOWER_TYPES.BARRACKS]: {
    name: 'Spirit Barracks',
    description: 'Summons warriors to block',
    icon: 'tower_barracks',
    cost: 70,
    targetMode: TARGET_MODE.NEAREST,
    canTargetFlying: false,
    isBarracks: true,
    levels: [
      { soldierHP: 40, soldierDamage: 5, soldierCount: 2, range: 60, respawnTime: 8000, special: null },
      { soldierHP: 60, soldierDamage: 8, soldierCount: 2, range: 70, respawnTime: 6000, special: null, upgradeCost: 50 },
      { soldierHP: 90, soldierDamage: 12, soldierCount: 3, range: 80, respawnTime: 4000, special: 'shield', upgradeCost: 100 },
    ],
  },

  [TOWER_TYPES.LIGHTNING]: {
    name: 'Lightning Pylon',
    description: 'Chain lightning between enemies',
    icon: 'tower_lightning',
    cost: 90,
    targetMode: TARGET_MODE.STRONGEST,
    canTargetFlying: true,
    levels: [
      { damage: 15, range: 85, fireRate: 1500, chainCount: 2, chainDamageFalloff: 0.7, special: null },
      { damage: 25, range: 95, fireRate: 1200, chainCount: 3, chainDamageFalloff: 0.75, special: null, upgradeCost: 70 },
      { damage: 40, range: 105, fireRate: 1000, chainCount: 4, chainDamageFalloff: 0.8, special: 'stun', upgradeCost: 130 },
    ],
    projectile: 'proj_lightning',
    projectileSpeed: 400,
  },

  [TOWER_TYPES.ENCHANTER]: {
    name: "Enchanter's Obelisk",
    description: 'Buffs nearby towers',
    icon: 'tower_enchanter',
    cost: 80,
    targetMode: null, // No attack
    canTargetFlying: false,
    isSupport: true,
    levels: [
      { range: 80, damageBoost: 0.15, rangeBoost: 0.1, special: null },
      { range: 90, damageBoost: 0.25, rangeBoost: 0.15, special: 'reveal', upgradeCost: 60 },
      { range: 100, damageBoost: 0.35, rangeBoost: 0.2, special: 'empower', upgradeCost: 120 },
    ],
  },
};

// Tower unlock order (which levels they become available)
export const TOWER_UNLOCKS = {
  [TOWER_TYPES.ARCANE]: 1,     // Available from level 1
  [TOWER_TYPES.FLAME]: 1,      // Available from level 1
  [TOWER_TYPES.FROST]: 2,      // Unlocked at level 2
  [TOWER_TYPES.BARRACKS]: 2,   // Unlocked at level 2
  [TOWER_TYPES.LIGHTNING]: 3,  // Unlocked at level 3
  [TOWER_TYPES.ENCHANTER]: 4,  // Unlocked at level 4
};
