import { CELL, TILE_SIZE, GRID_COLS, GRID_ROWS } from '../../utils/constants.js';
import { eventBus } from './EventBus.js';

// Cell type → display color
const CELL_COLORS = {
  [CELL.EMPTY]:  '#3e8948',
  [CELL.PATH]:   '#8b6914',
  [CELL.BUILD]:  '#7f8c8d',
  [CELL.WATER]:  '#0099db',
  [CELL.TREES]:  '#265c42',
  [CELL.ROCKS]:  '#3a3a5c',
  [CELL.START]:  '#2ecc71',
  [CELL.END]:    '#ffd700',
  [CELL.BRIDGE]: '#b8860b',
};

const CELL_LABELS = {
  [CELL.START]: 'S',
  [CELL.END]:   'E',
};

export default class MapRenderer {
  constructor(canvas, project) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.project = project;

    this.canvas.width = GRID_COLS * TILE_SIZE;
    this.canvas.height = GRID_ROWS * TILE_SIZE;

    this.cursorGx = -1;
    this.cursorGy = -1;
    this.showGrid = true;
    this.dirty = true;

    // Test path animation state
    this.testDot = null;

    this._onChanged = () => { this.dirty = true; };
    eventBus.on('map:changed', this._onChanged);
    eventBus.on('waypoints:changed', this._onChanged);
    eventBus.on('project:loaded', this._onChanged);
    eventBus.on('canvas:dirty', this._onChanged);

    this._raf = null;
    this._loop();
  }

  _loop() {
    this._raf = requestAnimationFrame(() => this._loop());
    if (!this.dirty && !this.testDot) return;
    this.dirty = false;
    this.render();
  }

  render() {
    const { ctx, project } = this;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw tiles
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        const cell = project.map[y][x];
        ctx.fillStyle = CELL_COLORS[cell] || CELL_COLORS[CELL.EMPTY];
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        const label = CELL_LABELS[cell];
        if (label) {
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2);
        }
      }
    }

    // Grid overlay
    if (this.showGrid) {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= GRID_COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * TILE_SIZE, 0);
        ctx.lineTo(x * TILE_SIZE, h);
        ctx.stroke();
      }
      for (let y = 0; y <= GRID_ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * TILE_SIZE);
        ctx.lineTo(w, y * TILE_SIZE);
        ctx.stroke();
      }
    }

    // Waypoints
    this._drawWaypoints(ctx);

    // Cursor highlight
    if (this.cursorGx >= 0 && this.cursorGx < GRID_COLS &&
        this.cursorGy >= 0 && this.cursorGy < GRID_ROWS) {
      ctx.strokeStyle = 'rgba(255,215,0,0.6)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(
        this.cursorGx * TILE_SIZE + 0.5,
        this.cursorGy * TILE_SIZE + 0.5,
        TILE_SIZE - 1,
        TILE_SIZE - 1,
      );
    }

    // Test dot
    if (this.testDot) {
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(this.testDot.x, this.testDot.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  _drawWaypoints(ctx) {
    const wps = this.project.waypoints;
    if (wps.length === 0) return;

    // Lines
    ctx.strokeStyle = 'rgba(0,255,0,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wps[0].x, wps[0].y);
    for (let i = 1; i < wps.length; i++) {
      ctx.lineTo(wps[i].x, wps[i].y);
    }
    ctx.stroke();

    // Direction arrows at midpoints
    ctx.fillStyle = 'rgba(0,255,0,0.4)';
    for (let i = 0; i < wps.length - 1; i++) {
      const mx = (wps[i].x + wps[i + 1].x) / 2;
      const my = (wps[i].y + wps[i + 1].y) / 2;
      const angle = Math.atan2(wps[i + 1].y - wps[i].y, wps[i + 1].x - wps[i].x);
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(-3, -3);
      ctx.lineTo(-3, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Circles + labels
    for (let i = 0; i < wps.length; i++) {
      const color = i === 0 ? '#2ecc71' : i === wps.length - 1 ? '#ffd700' : '#3498db';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(wps[i].x, wps[i].y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = '8px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${i}`, wps[i].x + 5, wps[i].y - 2);
    }
  }

  screenToGrid(canvasX, canvasY) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const lx = (canvasX - rect.left) * scaleX;
    const ly = (canvasY - rect.top) * scaleY;
    return {
      gx: Math.floor(lx / TILE_SIZE),
      gy: Math.floor(ly / TILE_SIZE),
    };
  }

  setCursor(gx, gy) {
    if (gx !== this.cursorGx || gy !== this.cursorGy) {
      this.cursorGx = gx;
      this.cursorGy = gy;
      this.dirty = true;
    }
  }

  clearCursor() {
    this.cursorGx = -1;
    this.cursorGy = -1;
    this.dirty = true;
  }

  destroy() {
    if (this._raf) cancelAnimationFrame(this._raf);
    eventBus.off('map:changed', this._onChanged);
    eventBus.off('waypoints:changed', this._onChanged);
    eventBus.off('project:loaded', this._onChanged);
    eventBus.off('canvas:dirty', this._onChanged);
  }
}
