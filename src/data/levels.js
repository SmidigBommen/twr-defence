import { ENEMY_TYPES, CELL } from '../utils/constants.js';

// Map legend:
// . = empty/grass, P = path, B = build spot, W = water, T = trees
// R = rocks, S = start, E = end (castle), ~ = bridge

function parseMap(strings) {
  const charMap = {
    '.': CELL.EMPTY,
    'P': CELL.PATH,
    'B': CELL.BUILD,
    'W': CELL.WATER,
    'T': CELL.TREES,
    'R': CELL.ROCKS,
    'S': CELL.START,
    'E': CELL.END,
    '~': CELL.BRIDGE,
  };
  return strings.map(row => [...row.padEnd(30, '.')].map(c => charMap[c] || CELL.EMPTY));
}

export const LEVELS = [
  // Level 1: The Emerald Forest
  {
    id: 1,
    name: 'The Emerald Forest',
    description: 'A peaceful forest path... but goblins approach!',
    theme: 'forest',
    startingGold: 120,
    lives: 20,
    map: parseMap([
      'TTTTT.....T...B...T.....TTTTT.',
      'T...T..B..T...............TTT.',
      'T.S.PPPPPPPPPP.B..T..B.....T.',
      'T...T..B..T...P...........TT.',
      'TTTTT.....T.B.P.T....B..TT...',
      '..........T...P.T........T...',
      '..B...T...TPPPP.TTT..B.......',
      '......T...TP..B.........T....',
      '..T...T.B.TP.....B...T..T...',
      '..T.......TPPPPP.....T.......',
      '..T..B....T.B..P..B...T..B..',
      '..........T....P..........T..',
      'T....B..T.T..BPPPPPPPPPE.TT.',
      'TT.......TT.....B....T..TTT.',
      'TTT..T..TTTT..........TTTTT.',
      'TTTTTTTTTTTTTT..T...TTTTTTT.',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTT.',
    ]),
    // Waypoints enemies follow (pixel coordinates)
    waypoints: [
      { x: 2 * 16 + 8, y: 2 * 16 + 8 },    // Start
      { x: 13 * 16 + 8, y: 2 * 16 + 8 },
      { x: 13 * 16 + 8, y: 6 * 16 + 8 },
      { x: 10 * 16 + 8, y: 6 * 16 + 8 },
      { x: 10 * 16 + 8, y: 9 * 16 + 8 },
      { x: 15 * 16 + 8, y: 9 * 16 + 8 },
      { x: 15 * 16 + 8, y: 12 * 16 + 8 },
      { x: 23 * 16 + 8, y: 12 * 16 + 8 }, // End
    ],
    waves: [
      {
        enemies: [
          { type: ENEMY_TYPES.GOBLIN, count: 6, interval: 1200 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.GOBLIN, count: 10, interval: 1000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.GOBLIN, count: 8, interval: 800 },
          { type: ENEMY_TYPES.WOLF_RIDER, count: 3, interval: 1500, delay: 5000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.WOLF_RIDER, count: 6, interval: 1200 },
          { type: ENEMY_TYPES.GOBLIN, count: 10, interval: 600, delay: 3000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.GOBLIN, count: 15, interval: 500 },
          { type: ENEMY_TYPES.WOLF_RIDER, count: 8, interval: 800, delay: 2000 },
          { type: ENEMY_TYPES.TROLL, count: 1, interval: 0, delay: 10000 },
        ],
      },
    ],
  },

  // Level 2: Mountain Pass
  {
    id: 2,
    name: 'Mountain Pass',
    description: 'A narrow mountain pass. Trolls lurk in the shadows.',
    theme: 'mountain',
    startingGold: 140,
    lives: 18,
    map: parseMap([
      'RRRRRRR...B...RRRRRRRRRRRRRR.',
      'RRRR.......................RR.',
      'RR.S.PPPPPPPPPP..B..RR.B..R..',
      'RR...R..B.....P......RR.....',
      'RRR..R........P..B...RR..R..',
      'RR...R....B...P......R...R..',
      'R..B.R..R...BPPPPPPP.R.B.R..',
      'R....R..R........B.P.R...R..',
      'R..R.R..R.B........P.....R..',
      'R..R.....R...B...BPP..B..R..',
      'RR.R..B..R.......P...R...RR.',
      'RR.R.....RRPPPPPPP...R..RRR.',
      'RR.R..B..R.P.B......RR.RRRR.',
      'R..R.....R.PPPPPPPPPE..RRRR.',
      'R..R..B..R....B...........R.',
      'RR.RRRR..RR......B..RR.RRRR.',
      'RRRRRRRRRRRR.....RRRRRRRRRR.',
    ]),
    waypoints: [
      { x: 2 * 16 + 8, y: 2 * 16 + 8 },
      { x: 11 * 16 + 8, y: 2 * 16 + 8 },
      { x: 11 * 16 + 8, y: 6 * 16 + 8 },
      { x: 17 * 16 + 8, y: 6 * 16 + 8 },
      { x: 17 * 16 + 8, y: 9 * 16 + 8 },
      { x: 14 * 16 + 8, y: 9 * 16 + 8 },
      { x: 14 * 16 + 8, y: 11 * 16 + 8 },
      { x: 11 * 16 + 8, y: 11 * 16 + 8 },
      { x: 11 * 16 + 8, y: 13 * 16 + 8 },
      { x: 22 * 16 + 8, y: 13 * 16 + 8 },
    ],
    waves: [
      {
        enemies: [
          { type: ENEMY_TYPES.GOBLIN, count: 8, interval: 1000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.GOBLIN, count: 6, interval: 800 },
          { type: ENEMY_TYPES.WOLF_RIDER, count: 4, interval: 1200, delay: 3000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.TROLL, count: 2, interval: 3000 },
          { type: ENEMY_TYPES.GOBLIN, count: 8, interval: 600, delay: 2000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.WOLF_RIDER, count: 8, interval: 800 },
          { type: ENEMY_TYPES.TROLL, count: 3, interval: 2500, delay: 4000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.GOBLIN, count: 12, interval: 500 },
          { type: ENEMY_TYPES.WOLF_RIDER, count: 6, interval: 700, delay: 2000 },
          { type: ENEMY_TYPES.TROLL, count: 4, interval: 2000, delay: 6000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.TROLL, count: 6, interval: 1800 },
          { type: ENEMY_TYPES.WOLF_RIDER, count: 10, interval: 600, delay: 3000 },
          { type: ENEMY_TYPES.GOBLIN, count: 15, interval: 400, delay: 5000 },
        ],
      },
    ],
  },

  // Level 3: Misty Marshlands
  {
    id: 3,
    name: 'Misty Marshlands',
    description: 'Mist covers the swamps. Harpies soar overhead!',
    theme: 'marsh',
    startingGold: 160,
    lives: 18,
    map: parseMap([
      'WW...B..WWWW..B...WW....WW..',
      'W..............WW......B.W..',
      'W.S.PPPPPPP..B.WW...........',
      'W...W.....P....W...B..WW...',
      'WW..W..B..P..WWW.....WW....',
      '....W.....PPPP.WW.B........',
      '.B..WW.B.....P.WW......B...',
      '....WW...B...P..W..........',
      '.......WW..BPPPPPPPP..WW...',
      '..B....WW........B.P..WW...',
      '.......WW..B.......P.......',
      '....B..W...........P..B....',
      '.......W...B...BPPPPPPPPE..',
      '..B....WW..............B...',
      '.......WWW....B...WW.......',
      '...B...WWWW.......WWW..B...',
      '......WWWWWW...WWWWWW......',
    ]),
    waypoints: [
      { x: 2 * 16 + 8, y: 2 * 16 + 8 },
      { x: 8 * 16 + 8, y: 2 * 16 + 8 },
      { x: 8 * 16 + 8, y: 5 * 16 + 8 },
      { x: 12 * 16 + 8, y: 5 * 16 + 8 },
      { x: 12 * 16 + 8, y: 8 * 16 + 8 },
      { x: 19 * 16 + 8, y: 8 * 16 + 8 },
      { x: 19 * 16 + 8, y: 12 * 16 + 8 },
      { x: 25 * 16 + 8, y: 12 * 16 + 8 },
    ],
    waves: [
      {
        enemies: [
          { type: ENEMY_TYPES.GOBLIN, count: 10, interval: 800 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.HARPY, count: 4, interval: 1500 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.GOBLIN, count: 8, interval: 700 },
          { type: ENEMY_TYPES.HARPY, count: 4, interval: 1200, delay: 3000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.WOLF_RIDER, count: 6, interval: 900 },
          { type: ENEMY_TYPES.HARPY, count: 6, interval: 1000, delay: 2000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.TROLL, count: 3, interval: 2500 },
          { type: ENEMY_TYPES.HARPY, count: 8, interval: 800, delay: 2000 },
          { type: ENEMY_TYPES.GOBLIN, count: 10, interval: 500, delay: 4000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.HARPY, count: 12, interval: 700 },
          { type: ENEMY_TYPES.WOLF_RIDER, count: 8, interval: 600, delay: 3000 },
          { type: ENEMY_TYPES.TROLL, count: 4, interval: 2000, delay: 6000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.IMP, count: 20, interval: 300 },
          { type: ENEMY_TYPES.HARPY, count: 10, interval: 800, delay: 3000 },
          { type: ENEMY_TYPES.TROLL, count: 5, interval: 1800, delay: 6000 },
        ],
      },
    ],
  },

  // Level 4: The Haunted Ruins
  {
    id: 4,
    name: 'The Haunted Ruins',
    description: 'Ancient ruins filled with dark magic. Wraiths and priests await.',
    theme: 'ruins',
    startingGold: 180,
    lives: 16,
    map: parseMap([
      'RR.R..B..RR.....B...RR..RR..',
      'R..............R........R...',
      'R.S.PPPPPP.B...R..B.......R.',
      'R........P.....RR........R..',
      'R..B...R.P.B.......B..R.R...',
      'R......R.PPPPPP........R....',
      '..B..R.R.....BP..R.B.......',
      '.....R.R......P..R.........',
      '..R....R..B...PPPPPPP..B...',
      '..R.B..R..........B.P.....',
      '..R....R......B.....P..B...',
      '..R....R..B.........P.....',
      '..R.B..RR......BPPPPPPPPE..',
      '..R....RR..B..............',
      '..RR..RRRR.......B..RR.R..',
      'RRRRRRRRRRR..R.....RRRRR...',
      'RRRRRRRRRRRRRRRR..RRRRRRRR.',
    ]),
    waypoints: [
      { x: 2 * 16 + 8, y: 2 * 16 + 8 },
      { x: 7 * 16 + 8, y: 2 * 16 + 8 },
      { x: 7 * 16 + 8, y: 5 * 16 + 8 },
      { x: 13 * 16 + 8, y: 5 * 16 + 8 },
      { x: 13 * 16 + 8, y: 8 * 16 + 8 },
      { x: 19 * 16 + 8, y: 8 * 16 + 8 },
      { x: 19 * 16 + 8, y: 12 * 16 + 8 },
      { x: 25 * 16 + 8, y: 12 * 16 + 8 },
    ],
    waves: [
      {
        enemies: [
          { type: ENEMY_TYPES.GOBLIN, count: 12, interval: 700 },
          { type: ENEMY_TYPES.WOLF_RIDER, count: 4, interval: 1000, delay: 3000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.WRAITH, count: 4, interval: 2000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.DARK_PRIEST, count: 3, interval: 2500 },
          { type: ENEMY_TYPES.GOBLIN, count: 10, interval: 600, delay: 2000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.WRAITH, count: 5, interval: 1500 },
          { type: ENEMY_TYPES.DARK_PRIEST, count: 3, interval: 2000, delay: 3000 },
          { type: ENEMY_TYPES.HARPY, count: 6, interval: 1000, delay: 4000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.TROLL, count: 4, interval: 2000 },
          { type: ENEMY_TYPES.DARK_PRIEST, count: 4, interval: 1800, delay: 2000 },
          { type: ENEMY_TYPES.WRAITH, count: 6, interval: 1200, delay: 4000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.IMP, count: 25, interval: 300 },
          { type: ENEMY_TYPES.WRAITH, count: 8, interval: 1000, delay: 3000 },
          { type: ENEMY_TYPES.TROLL, count: 5, interval: 1500, delay: 5000 },
          { type: ENEMY_TYPES.DARK_PRIEST, count: 4, interval: 2000, delay: 6000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.HARPY, count: 10, interval: 800 },
          { type: ENEMY_TYPES.WOLF_RIDER, count: 10, interval: 600, delay: 2000 },
          { type: ENEMY_TYPES.WRAITH, count: 8, interval: 1000, delay: 4000 },
          { type: ENEMY_TYPES.DARK_PRIEST, count: 5, interval: 1800, delay: 6000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.TROLL, count: 8, interval: 1500 },
          { type: ENEMY_TYPES.DARK_PRIEST, count: 6, interval: 1500, delay: 2000 },
          { type: ENEMY_TYPES.WRAITH, count: 10, interval: 800, delay: 4000 },
          { type: ENEMY_TYPES.IMP, count: 30, interval: 250, delay: 6000 },
        ],
      },
    ],
  },

  // Level 5: Dragon's Peak
  {
    id: 5,
    name: "Dragon's Peak",
    description: 'The dragon awaits atop the volcanic peak. All forces converge!',
    theme: 'volcanic',
    startingGold: 200,
    lives: 15,
    map: parseMap([
      'RR.RRR..B..RR.B...RRR.RRRRR.',
      'R................R......R...',
      'R.S.PPPPPPPPP..B.R..B...R...',
      'R.........B..P...R......R...',
      'R..B..RR.....P.B...RR..RR...',
      'R.....RR..B..PPPPPPP.......R',
      '..B...R..........B.P...B..R.',
      '......R....B.......P.....R..',
      '..R...R..R...B...BPPPP..R...',
      '..R.B....R.........B.P.....',
      '..R......R.....B.....P.B...',
      '..R..B...R.B.........P.....',
      '..R......RR....B.PPPPPPPPE.',
      '..RR.B..RRR.........B.....',
      '..RRR..RRRRR..B..RR..R.R...',
      'RRRRRRRRRRRR.....RRRRRRRRR..',
      'RRRRRRRRRRRRR..RRRRRRRRRRRR.',
    ]),
    waypoints: [
      { x: 2 * 16 + 8, y: 2 * 16 + 8 },
      { x: 11 * 16 + 8, y: 2 * 16 + 8 },
      { x: 11 * 16 + 8, y: 5 * 16 + 8 },
      { x: 17 * 16 + 8, y: 5 * 16 + 8 },
      { x: 17 * 16 + 8, y: 8 * 16 + 8 },
      { x: 21 * 16 + 8, y: 8 * 16 + 8 },
      { x: 21 * 16 + 8, y: 12 * 16 + 8 },
      { x: 27 * 16 + 8, y: 12 * 16 + 8 },
    ],
    waves: [
      {
        enemies: [
          { type: ENEMY_TYPES.GOBLIN, count: 15, interval: 500 },
          { type: ENEMY_TYPES.WOLF_RIDER, count: 6, interval: 800, delay: 2000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.TROLL, count: 4, interval: 2000 },
          { type: ENEMY_TYPES.DARK_PRIEST, count: 3, interval: 2500, delay: 3000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.HARPY, count: 10, interval: 700 },
          { type: ENEMY_TYPES.WRAITH, count: 6, interval: 1200, delay: 3000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.IMP, count: 30, interval: 250 },
          { type: ENEMY_TYPES.TROLL, count: 5, interval: 1800, delay: 4000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.WOLF_RIDER, count: 12, interval: 500 },
          { type: ENEMY_TYPES.HARPY, count: 8, interval: 800, delay: 2000 },
          { type: ENEMY_TYPES.DARK_PRIEST, count: 4, interval: 2000, delay: 5000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.TROLL, count: 6, interval: 1500 },
          { type: ENEMY_TYPES.WRAITH, count: 8, interval: 1000, delay: 2000 },
          { type: ENEMY_TYPES.HARPY, count: 10, interval: 700, delay: 4000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.GOBLIN, count: 20, interval: 400 },
          { type: ENEMY_TYPES.TROLL, count: 8, interval: 1200, delay: 3000 },
          { type: ENEMY_TYPES.DARK_PRIEST, count: 5, interval: 1800, delay: 5000 },
          { type: ENEMY_TYPES.WRAITH, count: 8, interval: 1000, delay: 7000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.DRAGON, count: 1, interval: 0 },
          { type: ENEMY_TYPES.HARPY, count: 12, interval: 600, delay: 5000 },
          { type: ENEMY_TYPES.IMP, count: 25, interval: 300, delay: 8000 },
        ],
      },
    ],
  },

  // Level 6: The Lich King's Throne
  {
    id: 6,
    name: "The Lich King's Throne",
    description: 'The final battle. Defeat the Lich King to save the realm!',
    theme: 'dark',
    startingGold: 220,
    lives: 12,
    map: parseMap([
      'RR.RR..B..RR..B..RR...RRRRR.',
      'R...............R.........R.',
      'R.S.PPPPPP..B...R...B..R..R.',
      'R........P......R......R....',
      'R..B..R..P..B.....B..R.R...',
      'R.....R..PPPPPPP.......R....',
      '..B...R........P...B.......',
      '......R..B.....P...........',
      '..R...R......BPPPPPPP..B...',
      '..R.B....R.........BP.....',
      '..R......R..B......BP.B...',
      '..R..B...R.........BP.....',
      '..R......RR..BPPPPPPPPPPE..',
      '..RR.B..RRR.........B.....',
      '..RRR..RRRRR..B..RR..R.R...',
      'RRRRRRRRRRRR.....RRRRRRRRR..',
      'RRRRRRRRRRRRR..RRRRRRRRRRRR.',
    ]),
    waypoints: [
      { x: 2 * 16 + 8, y: 2 * 16 + 8 },
      { x: 8 * 16 + 8, y: 2 * 16 + 8 },
      { x: 8 * 16 + 8, y: 5 * 16 + 8 },
      { x: 14 * 16 + 8, y: 5 * 16 + 8 },
      { x: 14 * 16 + 8, y: 8 * 16 + 8 },
      { x: 20 * 16 + 8, y: 8 * 16 + 8 },
      { x: 20 * 16 + 8, y: 12 * 16 + 8 },
      { x: 27 * 16 + 8, y: 12 * 16 + 8 },
    ],
    waves: [
      {
        enemies: [
          { type: ENEMY_TYPES.WRAITH, count: 8, interval: 1000 },
          { type: ENEMY_TYPES.DARK_PRIEST, count: 4, interval: 1800, delay: 3000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.IMP, count: 30, interval: 250 },
          { type: ENEMY_TYPES.TROLL, count: 5, interval: 2000, delay: 3000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.HARPY, count: 12, interval: 600 },
          { type: ENEMY_TYPES.WRAITH, count: 8, interval: 1000, delay: 3000 },
          { type: ENEMY_TYPES.DARK_PRIEST, count: 5, interval: 1500, delay: 5000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.TROLL, count: 8, interval: 1200 },
          { type: ENEMY_TYPES.WOLF_RIDER, count: 12, interval: 500, delay: 2000 },
          { type: ENEMY_TYPES.DARK_PRIEST, count: 6, interval: 1500, delay: 5000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.GOBLIN, count: 25, interval: 300 },
          { type: ENEMY_TYPES.HARPY, count: 12, interval: 700, delay: 2000 },
          { type: ENEMY_TYPES.TROLL, count: 6, interval: 1500, delay: 5000 },
          { type: ENEMY_TYPES.WRAITH, count: 10, interval: 800, delay: 7000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.DRAGON, count: 1, interval: 0 },
          { type: ENEMY_TYPES.IMP, count: 30, interval: 250, delay: 3000 },
          { type: ENEMY_TYPES.TROLL, count: 8, interval: 1200, delay: 6000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.WOLF_RIDER, count: 15, interval: 400 },
          { type: ENEMY_TYPES.HARPY, count: 15, interval: 500, delay: 2000 },
          { type: ENEMY_TYPES.WRAITH, count: 12, interval: 700, delay: 4000 },
          { type: ENEMY_TYPES.DARK_PRIEST, count: 8, interval: 1200, delay: 6000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.TROLL, count: 10, interval: 1000 },
          { type: ENEMY_TYPES.DRAGON, count: 1, interval: 0, delay: 5000 },
          { type: ENEMY_TYPES.DARK_PRIEST, count: 6, interval: 1500, delay: 7000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.IMP, count: 40, interval: 200 },
          { type: ENEMY_TYPES.WRAITH, count: 12, interval: 800, delay: 3000 },
          { type: ENEMY_TYPES.TROLL, count: 8, interval: 1200, delay: 5000 },
          { type: ENEMY_TYPES.DARK_PRIEST, count: 6, interval: 1500, delay: 7000 },
        ],
      },
      {
        enemies: [
          { type: ENEMY_TYPES.LICH, count: 1, interval: 0 },
          { type: ENEMY_TYPES.WRAITH, count: 15, interval: 600, delay: 5000 },
          { type: ENEMY_TYPES.DARK_PRIEST, count: 8, interval: 1000, delay: 8000 },
          { type: ENEMY_TYPES.IMP, count: 30, interval: 250, delay: 10000 },
        ],
      },
    ],
  },
];

// Level unlock tracking via localStorage
const UNLOCK_KEY = 'arcane_defenders_unlocks';

export function getUnlockedLevels() {
  try {
    const data = localStorage.getItem(UNLOCK_KEY);
    return data ? JSON.parse(data) : [1];
  } catch {
    return [1];
  }
}

export function unlockLevel(levelId) {
  const unlocked = getUnlockedLevels();
  if (!unlocked.includes(levelId)) {
    unlocked.push(levelId);
    localStorage.setItem(UNLOCK_KEY, JSON.stringify(unlocked));
  }
}
