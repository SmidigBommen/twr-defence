import { CELL, GRID_COLS, GRID_ROWS, TILE_SIZE } from '../../utils/constants.js';
import { eventBus } from './EventBus.js';

export default class LevelProject {
  constructor() {
    this.name = 'Untitled';
    this.startingGold = 120;
    this.lives = 20;
    this.map = this._emptyMap();
    this.waypoints = [];
    this.waves = [];
  }

  _emptyMap() {
    const map = [];
    for (let y = 0; y < GRID_ROWS; y++) {
      map[y] = new Array(GRID_COLS).fill(CELL.EMPTY);
    }
    return map;
  }

  getCell(gx, gy) {
    if (gx < 0 || gx >= GRID_COLS || gy < 0 || gy >= GRID_ROWS) return CELL.EMPTY;
    return this.map[gy][gx];
  }

  setCell(gx, gy, value) {
    if (gx < 0 || gx >= GRID_COLS || gy < 0 || gy >= GRID_ROWS) return;
    this.map[gy][gx] = value;
    eventBus.emit('map:changed');
  }

  /** For START/END: clear any existing cell of this type first */
  setUniqueCell(gx, gy, value) {
    if (gx < 0 || gx >= GRID_COLS || gy < 0 || gy >= GRID_ROWS) return;
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        if (this.map[y][x] === value) this.map[y][x] = CELL.EMPTY;
      }
    }
    this.map[gy][gx] = value;
    eventBus.emit('map:changed');
  }

  addWaypoint(gx, gy) {
    this.waypoints.push({
      x: gx * TILE_SIZE + TILE_SIZE / 2,
      y: gy * TILE_SIZE + TILE_SIZE / 2,
    });
    eventBus.emit('waypoints:changed');
  }

  removeWaypointAt(gx, gy) {
    const px = gx * TILE_SIZE + TILE_SIZE / 2;
    const py = gy * TILE_SIZE + TILE_SIZE / 2;
    for (let i = this.waypoints.length - 1; i >= 0; i--) {
      if (Math.abs(this.waypoints[i].x - px) < TILE_SIZE &&
          Math.abs(this.waypoints[i].y - py) < TILE_SIZE) {
        this.waypoints.splice(i, 1);
        eventBus.emit('waypoints:changed');
        return true;
      }
    }
    return false;
  }

  snapshot() {
    return {
      name: this.name,
      startingGold: this.startingGold,
      lives: this.lives,
      map: this.map.map(row => [...row]),
      waypoints: this.waypoints.map(w => ({ ...w })),
      waves: JSON.parse(JSON.stringify(this.waves)),
    };
  }

  restore(snap) {
    this.name = snap.name;
    this.startingGold = snap.startingGold;
    this.lives = snap.lives;
    this.map = snap.map.map(row => [...row]);
    this.waypoints = snap.waypoints.map(w => ({ ...w }));
    this.waves = snap.waves ? JSON.parse(JSON.stringify(snap.waves)) : [];
    eventBus.emit('project:loaded');
  }

  loadFromLevel(level) {
    this.name = level.name || 'Untitled';
    this.startingGold = level.startingGold || 120;
    this.lives = level.lives || 20;
    this.map = this._emptyMap();
    for (let y = 0; y < Math.min(level.map.length, GRID_ROWS); y++) {
      for (let x = 0; x < Math.min(level.map[y].length, GRID_COLS); x++) {
        this.map[y][x] = level.map[y][x];
      }
    }
    this.waypoints = (level.waypoints || []).map(w => ({ ...w }));
    this.waves = level.waves ? JSON.parse(JSON.stringify(level.waves)) : [];
    eventBus.emit('project:loaded');
  }

  clearMap() {
    this.map = this._emptyMap();
    this.waypoints = [];
    this.waves = [];
    eventBus.emit('project:loaded');
  }

  clearPath() {
    const pathCells = new Set([CELL.PATH, CELL.START, CELL.END, CELL.BRIDGE]);
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        if (pathCells.has(this.map[y][x])) this.map[y][x] = CELL.EMPTY;
      }
    }
    this.waypoints = [];
    eventBus.emit('project:loaded');
  }
}
