import { CELL, TILE_SIZE } from './constants.js';

/**
 * Automatically trace a path through the map from START to END,
 * generating waypoints at every turn/corner.
 *
 * @param {number[][]} map - 2D array of cell types
 * @returns {Array<{x: number, y: number}>} - Waypoints in pixel coordinates
 */
export function tracePathWaypoints(map) {
  const rows = map.length;
  const cols = map[0] ? map[0].length : 0;

  // Find START and END cells
  let start = null;
  let end = null;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (map[y][x] === CELL.START) start = { x, y };
      if (map[y][x] === CELL.END) end = { x, y };
    }
  }

  if (!start || !end) {
    console.warn('Path tracer: missing START or END cell');
    return [];
  }

  // Walk the path from START to END
  const isPath = (x, y) => {
    if (x < 0 || x >= cols || y < 0 || y >= rows) return false;
    const c = map[y][x];
    return c === CELL.PATH || c === CELL.START || c === CELL.END || c === CELL.BRIDGE;
  };

  const directions = [
    { dx: 1, dy: 0 },  // right
    { dx: -1, dy: 0 }, // left
    { dx: 0, dy: 1 },  // down
    { dx: 0, dy: -1 }, // up
  ];

  // BFS/walk to trace the path
  const visited = new Set();
  const path = []; // Array of {x, y} grid positions

  let current = { ...start };
  let prevDir = null;

  visited.add(`${current.x},${current.y}`);
  path.push({ ...current });

  let safety = 0;
  const maxSteps = rows * cols;

  while (current.x !== end.x || current.y !== end.y) {
    if (++safety > maxSteps) {
      console.warn('Path tracer: exceeded max steps, path may be broken');
      break;
    }

    let moved = false;
    for (const dir of directions) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;
      const key = `${nx},${ny}`;

      if (!visited.has(key) && isPath(nx, ny)) {
        visited.add(key);
        current = { x: nx, y: ny };
        path.push({ ...current });
        prevDir = dir;
        moved = true;
        break;
      }
    }

    if (!moved) {
      // Dead end or disconnected path - try backtracking
      console.warn('Path tracer: dead end at', current.x, current.y);
      break;
    }
  }

  // Convert path to waypoints (only at turns + start + end)
  const waypoints = [];
  waypoints.push(gridToPixel(path[0]));

  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const next = path[i + 1];

    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    // Direction changed = this is a turn = add waypoint
    if (dx1 !== dx2 || dy1 !== dy2) {
      waypoints.push(gridToPixel(curr));
    }
  }

  // Add end point
  if (path.length > 1) {
    waypoints.push(gridToPixel(path[path.length - 1]));
  }

  return waypoints;
}

function gridToPixel(gridPos) {
  return {
    x: gridPos.x * TILE_SIZE + TILE_SIZE / 2,
    y: gridPos.y * TILE_SIZE + TILE_SIZE / 2,
  };
}

/**
 * Convert a 2D map array back to ASCII string representation.
 */
export function mapToAscii(map) {
  const reverseMap = {
    [CELL.EMPTY]: '.',
    [CELL.PATH]: 'P',
    [CELL.BUILD]: 'B',
    [CELL.WATER]: 'W',
    [CELL.TREES]: 'T',
    [CELL.ROCKS]: 'R',
    [CELL.START]: 'S',
    [CELL.END]: 'E',
    [CELL.BRIDGE]: '~',
  };

  return map.map(row =>
    row.map(cell => reverseMap[cell] || '.').join('')
  );
}

/**
 * Validate a map for common issues.
 * Returns an array of warning strings.
 */
export function validateMap(map) {
  const warnings = [];
  const rows = map.length;
  const cols = map[0] ? map[0].length : 0;

  let startCount = 0;
  let endCount = 0;
  let pathCount = 0;
  let buildCount = 0;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const c = map[y][x];
      if (c === CELL.START) startCount++;
      if (c === CELL.END) endCount++;
      if (c === CELL.PATH || c === CELL.BRIDGE) pathCount++;
      if (c === CELL.BUILD) buildCount++;
    }
  }

  if (startCount === 0) warnings.push('No START tile (S)');
  if (startCount > 1) warnings.push('Multiple START tiles');
  if (endCount === 0) warnings.push('No END tile (E)');
  if (endCount > 1) warnings.push('Multiple END tiles');
  if (pathCount === 0) warnings.push('No PATH tiles');
  if (buildCount === 0) warnings.push('No BUILD spots');

  // Try to trace the path
  if (startCount === 1 && endCount === 1) {
    const waypoints = tracePathWaypoints(map);
    if (waypoints.length < 2) {
      warnings.push('Path is broken: cannot trace from START to END');
    }
  }

  return warnings;
}
