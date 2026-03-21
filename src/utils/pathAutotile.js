import { CELL } from './constants.js';

// Cells that count as "path-like" for neighbor connectivity
const PATH_CELLS = new Set([CELL.PATH, CELL.START, CELL.END, CELL.BRIDGE]);

// Bitmask: bit0=N(1), bit1=E(2), bit2=S(4), bit3=W(8)
// Each entry: [textureKey, rotationAngle]
const AUTOTILE_TABLE = [
  ['tile_path',          0],    //  0: 0000 isolated → full dirt
  ['tile_path_end',      0],    //  1: 0001 N
  ['tile_path_end',      90],   //  2: 0010 E
  ['tile_path_corner',   0],    //  3: 0011 N+E
  ['tile_path_end',      180],  //  4: 0100 S
  ['tile_path_straight', 0],    //  5: 0101 N+S
  ['tile_path_corner',   90],   //  6: 0110 E+S
  ['tile_path_tjunction', 0],   //  7: 0111 N+E+S
  ['tile_path_end',      270],  //  8: 1000 W
  ['tile_path_corner',   270],  //  9: 1001 N+W
  ['tile_path_straight', 90],   // 10: 1010 E+W
  ['tile_path_tjunction', 270], // 11: 1011 N+E+W
  ['tile_path_corner',   180],  // 12: 1100 S+W
  ['tile_path_tjunction', 180], // 13: 1101 N+S+W
  ['tile_path_tjunction', 90],  // 14: 1110 E+S+W
  ['tile_path',          0],    // 15: 1111 all → full dirt
];

/**
 * Determine the correct path tile variant and rotation for a cell.
 * @param {number[][]} map - 2D grid of CELL values
 * @param {number} x - column index
 * @param {number} y - row index
 * @returns {{ key: string, angle: number }}
 */
export function getPathTile(map, x, y) {
  const rows = map.length;
  const cols = map[0].length;

  const isPath = (nx, ny) =>
    nx >= 0 && ny >= 0 && nx < cols && ny < rows && PATH_CELLS.has(map[ny][nx]);

  const mask =
    (isPath(x, y - 1) ? 1 : 0) |  // N
    (isPath(x + 1, y) ? 2 : 0) |  // E
    (isPath(x, y + 1) ? 4 : 0) |  // S
    (isPath(x - 1, y) ? 8 : 0);   // W

  const entry = AUTOTILE_TABLE[mask];
  return { key: entry[0], angle: entry[1] };
}
