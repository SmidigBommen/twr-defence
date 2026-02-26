import { GRID_COLS, GRID_ROWS } from '../../utils/constants.js';
import { eventBus } from '../core/EventBus.js';
import Tool from './Tool.js';

export default class FillTool extends Tool {
  constructor() {
    super('Fill', 'G', 'G');
    this.activeTile = null; // set by EditorApp from PaintTool.activeTile
  }

  onPointerDown(gx, gy, project) {
    if (this.activeTile == null) return;
    const target = project.map[gy][gx];
    if (target === this.activeTile) return;

    // BFS flood fill
    const queue = [[gx, gy]];
    const visited = new Set();
    visited.add(`${gx},${gy}`);

    while (queue.length > 0) {
      const [cx, cy] = queue.shift();
      project.map[cy][cx] = this.activeTile;

      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx;
        const ny = cy + dy;
        const key = `${nx},${ny}`;
        if (nx < 0 || nx >= GRID_COLS || ny < 0 || ny >= GRID_ROWS) continue;
        if (visited.has(key)) continue;
        if (project.map[ny][nx] !== target) continue;
        visited.add(key);
        queue.push([nx, ny]);
      }
    }

    eventBus.emit('map:changed');
  }
}
