import { CELL, GRID_COLS, GRID_ROWS, TILE_SIZE } from '../utils/constants.js';
import { LEVELS } from '../data/levels.js';
import { tracePathWaypoints, validateMap } from '../utils/pathTracer.js';
import { eventBus } from './core/EventBus.js';
import LevelProject from './core/LevelProject.js';
import HistoryManager from './core/HistoryManager.js';
import MapRenderer from './core/MapRenderer.js';
import LevelSerializer from './core/LevelSerializer.js';
import PaintTool from './tools/PaintTool.js';
import EraseTool from './tools/EraseTool.js';
import FillTool from './tools/FillTool.js';
import WaypointTool from './tools/WaypointTool.js';
import Toolbar from './ui/Toolbar.js';
import RightPanel from './ui/RightPanel.js';
import TilePalette from './ui/TilePalette.js';
import SpriteLibrary from './ui/SpriteLibrary.js';
import WaveEditor from './ui/WaveEditor.js';
import TopBar from './ui/TopBar.js';
import StatusBar from './ui/StatusBar.js';
import SpriteLoader from './core/SpriteLoader.js';

export default class EditorApp {
  constructor() {
    // Core
    this.project = new LevelProject();
    this.history = new HistoryManager(this.project);
    this.serializer = new LevelSerializer(this.project);
    this.spriteLoader = new SpriteLoader();

    // Canvas & renderer
    const canvas = document.getElementById('map-canvas');
    this.renderer = new MapRenderer(canvas, this.project, this.spriteLoader);

    // Tools
    this.tools = {
      paint: new PaintTool(),
      erase: new EraseTool(),
      fill: new FillTool(),
      waypoint: new WaypointTool(),
    };
    this.activeTool = this.tools.paint;

    // UI — tabbed right panel
    this.rightPanel = new RightPanel(document.getElementById('right'));
    this.toolbar = new Toolbar(document.getElementById('toolbar'));
    this.tilePalette = new TilePalette(this.rightPanel.getContent('map'), this.project);
    this.spriteLibrary = new SpriteLibrary(this.rightPanel.getContent('sprites'), this.spriteLoader);
    this.waveEditor = new WaveEditor(this.rightPanel.getContent('waves'), this.project, this.history, this.spriteLoader);
    this.topBar = new TopBar(document.getElementById('topbar'), this.project);
    this.statusBar = new StatusBar(document.getElementById('statusbar'));

    // Drawing state
    this._drawing = false;
    this._lastGx = -1;
    this._lastGy = -1;
    this._historyPushed = false;

    // Test path animation
    this._testAnim = null;

    this._bindEvents();
    this._bindCanvas();
    this._bindKeyboard();
    this._fitCanvas();
    window.addEventListener('resize', () => this._fitCanvas());

    // Restore autosave on startup
    this.serializer.loadAutosave();
  }

  // --- Event routing ---

  _bindEvents() {
    eventBus.on('tool:select', (id) => this._selectTool(id));
    eventBus.on('tile:select', (tileId) => this._selectTile(tileId));

    eventBus.on('history:undo', () => this.history.undo());
    eventBus.on('history:redo', () => this.history.redo());
    eventBus.on('map:clear', () => {
      this.history.pushState();
      this.project.clearMap();
    });

    eventBus.on('project:save', () => this.serializer.save());
    eventBus.on('project:load', () => this.serializer.load());
    eventBus.on('project:export', () => this.serializer.exportToClipboard());
    eventBus.on('project:play', () => this.serializer.playInGame());

    // Autosave to localStorage on every map/waypoint/wave change
    eventBus.on('map:changed', () => this.serializer.autosave());
    eventBus.on('waypoints:changed', () => this.serializer.autosave());
    eventBus.on('project:loaded', () => this.serializer.autosave());
    eventBus.on('waves:changed', () => this.serializer.autosave());

    eventBus.on('action:autoTrace', () => this._autoTrace());
    eventBus.on('action:testPath', () => this._testPath());
    eventBus.on('action:validate', () => this._validate());
    eventBus.on('action:clearPath', () => this._clearPath());
    eventBus.on('action:clearWaypoints', () => this._clearWaypoints());
    eventBus.on('action:loadCampaign', (id) => this._loadCampaign(id));
  }

  // --- Canvas input ---

  _bindCanvas() {
    const canvas = this.renderer.canvas;

    canvas.addEventListener('pointerdown', (e) => {
      const { gx, gy } = this.renderer.screenToGrid(e.clientX, e.clientY);
      if (gx < 0 || gx >= GRID_COLS || gy < 0 || gy >= GRID_ROWS) return;

      this._drawing = true;
      this._historyPushed = false;

      if (this.activeTool !== this.tools.waypoint) {
        this.history.pushState();
        this._historyPushed = true;
      }

      this.activeTool.onPointerDown(gx, gy, this.project);
      this._lastGx = gx;
      this._lastGy = gy;
    });

    canvas.addEventListener('pointermove', (e) => {
      const { gx, gy } = this.renderer.screenToGrid(e.clientX, e.clientY);

      // Cursor display
      if (gx >= 0 && gx < GRID_COLS && gy >= 0 && gy < GRID_ROWS) {
        this.renderer.setCursor(gx, gy);
        eventBus.emit('cursor:move', gx, gy, this.project.getCell(gx, gy));
      } else {
        this.renderer.clearCursor();
        eventBus.emit('cursor:leave');
      }

      // Drawing
      if (!this._drawing) return;
      if (gx === this._lastGx && gy === this._lastGy) return;
      if (gx < 0 || gx >= GRID_COLS || gy < 0 || gy >= GRID_ROWS) return;

      this.activeTool.onPointerMove(gx, gy, this.project);
      this._lastGx = gx;
      this._lastGy = gy;
    });

    const stopDraw = () => {
      if (this._drawing) {
        this.activeTool.onPointerUp(this._lastGx, this._lastGy, this.project);
        this._drawing = false;
      }
    };
    canvas.addEventListener('pointerup', stopDraw);
    canvas.addEventListener('pointerleave', () => {
      stopDraw();
      this.renderer.clearCursor();
      eventBus.emit('cursor:leave');
    });
  }

  // --- Keyboard shortcuts ---

  _bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      // Don't capture when typing in inputs or selects
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      const key = e.key.toUpperCase();

      // Ctrl+Z / Ctrl+Shift+Z
      if ((e.ctrlKey || e.metaKey) && key === 'Z') {
        e.preventDefault();
        if (e.shiftKey) {
          this.history.redo();
        } else {
          this.history.undo();
        }
        return;
      }

      // Ctrl+S
      if ((e.ctrlKey || e.metaKey) && key === 'S') {
        e.preventDefault();
        this.serializer.saveToLocalStorage();
        return;
      }

      // Tool shortcuts
      switch (key) {
        case 'B': this._selectTool('paint'); break;
        case 'E': this._selectTool('erase'); break;
        case 'G': this._selectTool('fill'); break;
        case 'W': this._selectTool('waypoint'); break;
      }

      // Tile shortcuts 1-9
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        const tiles = [CELL.EMPTY, CELL.PATH, CELL.BUILD, CELL.TREES, CELL.ROCKS, CELL.WATER, CELL.START, CELL.END, CELL.BRIDGE];
        this._selectTile(tiles[num - 1]);
        // Auto-switch to paint tool
        if (this.activeTool !== this.tools.paint) {
          this._selectTool('paint');
        }
      }
    });
  }

  // --- Tool/tile selection ---

  _selectTool(id) {
    if (!this.tools[id]) return;
    this.activeTool = this.tools[id];
    this.toolbar.setActive(id);
  }

  _selectTile(tileId) {
    this.tools.paint.activeTile = tileId;
    this.tools.fill.activeTile = tileId;
    this.tilePalette.setActiveTile(tileId);
  }

  // --- Actions ---

  _autoTrace() {
    const warnings = validateMap(this.project.map);
    if (warnings.length > 0) {
      eventBus.emit('status:message', 'ERR: ' + warnings[0], '#e74c3c');
      return;
    }
    this.history.pushState();
    const wps = tracePathWaypoints(this.project.map);
    this.project.waypoints = wps;
    eventBus.emit('waypoints:changed');
    eventBus.emit('status:message', `Auto-traced ${wps.length} waypoints`);
  }

  _clearPath() {
    this.history.pushState();
    this.project.clearPath();
    eventBus.emit('status:message', 'Path cleared');
  }

  _clearWaypoints() {
    this.history.pushState();
    this.project.waypoints = [];
    eventBus.emit('waypoints:changed');
    eventBus.emit('status:message', 'Waypoints cleared');
  }

  _validate() {
    const warnings = validateMap(this.project.map);
    if (warnings.length === 0) {
      eventBus.emit('status:message', 'Map is valid!');
    } else {
      eventBus.emit('status:message', warnings.join('; '), '#e74c3c');
    }
  }

  _testPath() {
    if (this._testAnim) {
      this._stopTest();
      return;
    }

    const wps = this.project.waypoints;
    if (wps.length < 2) {
      eventBus.emit('status:message', 'Need waypoints. Use Auto Trace first.', '#e74c3c');
      return;
    }

    eventBus.emit('status:message', 'Testing path... (click Test Path to stop)', '#f39c12');

    let wpIndex = 0;
    const speed = 60; // px/s
    const dot = { x: wps[0].x, y: wps[0].y };
    this.renderer.testDot = dot;

    const step = () => {
      if (wpIndex >= wps.length - 1) {
        this._stopTest();
        eventBus.emit('status:message', 'Path test complete!');
        return;
      }

      const target = wps[wpIndex + 1];
      const dx = target.x - dot.x;
      const dy = target.y - dot.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 2) {
        wpIndex++;
      } else {
        dot.x += (dx / dist) * speed * (1 / 60);
        dot.y += (dy / dist) * speed * (1 / 60);
      }

      this.renderer.dirty = true;
      this._testAnim = requestAnimationFrame(step);
    };

    this._testAnim = requestAnimationFrame(step);
  }

  _stopTest() {
    if (this._testAnim) {
      cancelAnimationFrame(this._testAnim);
      this._testAnim = null;
    }
    this.renderer.testDot = null;
    this.renderer.dirty = true;
  }

  _loadCampaign(id) {
    const level = LEVELS[id - 1];
    if (!level) return;
    this.history.pushState();
    this.project.loadFromLevel(level);
    eventBus.emit('status:message', `Loaded "${level.name}"`);
  }

  // --- Canvas scaling ---

  _fitCanvas() {
    const wrap = document.getElementById('canvas-wrap');
    const canvas = this.renderer.canvas;
    const maxW = wrap.clientWidth - 8;
    const maxH = wrap.clientHeight - 8;
    const nativeW = GRID_COLS * TILE_SIZE;
    const nativeH = GRID_ROWS * TILE_SIZE;
    const scale = Math.min(maxW / nativeW, maxH / nativeH, 3);
    canvas.style.width = `${Math.floor(nativeW * scale)}px`;
    canvas.style.height = `${Math.floor(nativeH * scale)}px`;
  }
}
