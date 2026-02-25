import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, CELL, GRID_COLS, GRID_ROWS } from '../utils/constants.js';
import { tracePathWaypoints, mapToAscii, validateMap } from '../utils/pathTracer.js';
import { LEVELS } from '../data/levels.js';

const TOOLS = [
  { id: CELL.EMPTY, label: 'Grass', key: '1', color: 0x3e8948 },
  { id: CELL.PATH, label: 'Path', key: '2', color: 0x8b6914 },
  { id: CELL.BUILD, label: 'Build', key: '3', color: 0x7f8c8d },
  { id: CELL.TREES, label: 'Tree', key: '4', color: 0x265c42 },
  { id: CELL.ROCKS, label: 'Rock', key: '5', color: 0x3a3a5c },
  { id: CELL.WATER, label: 'Water', key: '6', color: 0x0099db },
  { id: CELL.START, label: 'Start', key: '7', color: 0x2ecc71 },
  { id: CELL.END, label: 'End', key: '8', color: 0xffd700 },
  { id: CELL.BRIDGE, label: 'Bridge', key: '9', color: 0xb8860b },
];

export default class EditorScene extends Phaser.Scene {
  constructor() {
    super('EditorScene');
  }

  init(data) {
    this.loadLevelId = data.levelId || null;
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.DARK_BG);

    // Initialize empty map
    this.map = [];
    for (let y = 0; y < GRID_ROWS; y++) {
      this.map[y] = [];
      for (let x = 0; x < GRID_COLS; x++) {
        this.map[y][x] = CELL.EMPTY;
      }
    }

    // State
    this.currentTool = CELL.PATH;
    this.waypointMode = false;
    this.manualWaypoints = [];
    this.isDrawing = false;
    this.showGrid = true;
    this.testEnemy = null;
    this.testRunning = false;

    // Load level if specified
    if (this.loadLevelId) {
      this.loadLevel(this.loadLevelId);
    }

    // Render
    this.tileSprites = [];
    this.renderFullMap();
    this.createToolbar();
    this.createTopBar();
    this.createWaypointOverlay();

    // Input
    this.input.on('pointerdown', (p) => this.onPointerDown(p));
    this.input.on('pointermove', (p) => this.onPointerMove(p));
    this.input.on('pointerup', () => this.isDrawing = false);

    // Keyboard shortcuts
    for (const tool of TOOLS) {
      this.input.keyboard.on(`keydown-${tool.key}`, () => {
        this.waypointMode = false;
        this.currentTool = tool.id;
        this.updateToolbar();
      });
    }
    this.input.keyboard.on('keydown-W', () => this.toggleWaypointMode());
    this.input.keyboard.on('keydown-T', () => this.testPath());
    this.input.keyboard.on('keydown-A', () => this.autoTraceWaypoints());
    this.input.keyboard.on('keydown-E', () => this.exportLevel());
    this.input.keyboard.on('keydown-G', () => this.toggleGrid());
    this.input.keyboard.on('keydown-Z', () => this.undo());
    this.input.keyboard.on('keydown-C', () => this.clearMap());
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('MenuScene'));

    // Undo stack
    this.undoStack = [];

    // Status text
    this.statusText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 3, '', {
      fontSize: '6px',
      fontFamily: 'monospace',
      color: '#2ecc71',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5, 1).setDepth(60);
  }

  loadLevel(id) {
    const level = LEVELS.find(l => l.id === id);
    if (!level) return;

    for (let y = 0; y < Math.min(level.map.length, GRID_ROWS); y++) {
      for (let x = 0; x < Math.min(level.map[y].length, GRID_COLS); x++) {
        this.map[y][x] = level.map[y][x];
      }
    }

    // Load existing waypoints
    if (level.waypoints && level.waypoints.length > 0) {
      this.manualWaypoints = level.waypoints.map(w => ({ ...w }));
    }
  }

  // === RENDERING ===

  renderFullMap() {
    // Destroy existing sprites
    for (const s of this.tileSprites) {
      if (s) s.destroy();
    }
    this.tileSprites = [];

    const treeVariants = ['tile_trees', 'tile_trees2', 'tile_trees3'];
    const tileTextures = {
      [CELL.EMPTY]: 'tile_grass',
      [CELL.PATH]: 'tile_path',
      [CELL.BUILD]: 'tile_build',
      [CELL.WATER]: 'tile_water',
      [CELL.ROCKS]: 'tile_rocks',
      [CELL.START]: 'tile_path',
      [CELL.END]: 'tile_castle',
      [CELL.BRIDGE]: 'tile_path',
    };

    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        const px = x * TILE_SIZE + TILE_SIZE / 2;
        const py = y * TILE_SIZE + TILE_SIZE / 2;
        const cellType = this.map[y][x];

        // Always draw grass base
        const grass = this.add.image(px, py, 'tile_grass');
        grass.setDepth(0);
        this.tileSprites.push(grass);

        if (cellType !== CELL.EMPTY) {
          let tex;
          if (cellType === CELL.TREES) {
            tex = treeVariants[(x * 7 + y * 13) % treeVariants.length];
          } else {
            tex = tileTextures[cellType] || 'tile_grass';
          }
          const tile = this.add.image(px, py, tex);
          tile.setDepth(1);
          this.tileSprites.push(tile);
        }

        // Start/End markers
        if (cellType === CELL.START) {
          const marker = this.add.text(px, py, 'S', {
            fontSize: '10px', fontFamily: 'monospace', color: '#2ecc71',
            stroke: '#000', strokeThickness: 2,
          }).setOrigin(0.5).setDepth(5);
          this.tileSprites.push(marker);
        } else if (cellType === CELL.END) {
          const marker = this.add.text(px, py, 'E', {
            fontSize: '10px', fontFamily: 'monospace', color: '#ffd700',
            stroke: '#000', strokeThickness: 2,
          }).setOrigin(0.5).setDepth(5);
          this.tileSprites.push(marker);
        }
      }
    }

    // Grid overlay
    this.drawGrid();
    this.drawWaypoints();
  }

  renderTile(gx, gy) {
    // Re-render a single tile (cheaper than full re-render)
    // For simplicity, just do a full re-render
    this.renderFullMap();
  }

  drawGrid() {
    if (this.gridGraphics) this.gridGraphics.destroy();
    if (!this.showGrid) return;

    this.gridGraphics = this.add.graphics();
    this.gridGraphics.setDepth(2);
    this.gridGraphics.lineStyle(0.5, 0xffffff, 0.08);

    for (let x = 0; x <= GRID_COLS; x++) {
      this.gridGraphics.lineBetween(x * TILE_SIZE, 0, x * TILE_SIZE, GRID_ROWS * TILE_SIZE);
    }
    for (let y = 0; y <= GRID_ROWS; y++) {
      this.gridGraphics.lineBetween(0, y * TILE_SIZE, GRID_COLS * TILE_SIZE, y * TILE_SIZE);
    }
  }

  drawWaypoints() {
    if (this.waypointGraphics) this.waypointGraphics.destroy();
    if (this.waypointLabels) {
      for (const l of this.waypointLabels) l.destroy();
    }
    this.waypointGraphics = this.add.graphics();
    this.waypointGraphics.setDepth(10);
    this.waypointLabels = [];

    const wps = this.manualWaypoints;
    if (wps.length === 0) return;

    // Draw lines between waypoints
    this.waypointGraphics.lineStyle(2, 0x00ff00, 0.6);
    this.waypointGraphics.beginPath();
    this.waypointGraphics.moveTo(wps[0].x, wps[0].y);
    for (let i = 1; i < wps.length; i++) {
      this.waypointGraphics.lineTo(wps[i].x, wps[i].y);
    }
    this.waypointGraphics.strokePath();

    // Draw numbered circles at each waypoint
    for (let i = 0; i < wps.length; i++) {
      this.waypointGraphics.fillStyle(i === 0 ? 0x2ecc71 : i === wps.length - 1 ? 0xffd700 : 0x3498db, 0.8);
      this.waypointGraphics.fillCircle(wps[i].x, wps[i].y, 4);
      this.waypointGraphics.lineStyle(1, 0xffffff, 0.8);
      this.waypointGraphics.strokeCircle(wps[i].x, wps[i].y, 4);
      this.waypointGraphics.lineStyle(2, 0x00ff00, 0.6);

      const label = this.add.text(wps[i].x + 5, wps[i].y - 6, `${i}`, {
        fontSize: '6px', fontFamily: 'monospace', color: '#ffffff',
        stroke: '#000', strokeThickness: 1,
      }).setDepth(11);
      this.waypointLabels.push(label);
    }
  }

  // === TOOLBAR ===

  createToolbar() {
    this.toolbarContainer = this.add.container(0, 0).setDepth(50);

    // Background bar
    const barY = GAME_HEIGHT - 16;
    const bg = this.add.rectangle(GAME_WIDTH / 2, barY + 4, GAME_WIDTH, 20, 0x0a0a1a, 0.85);
    this.toolbarContainer.add(bg);

    this.toolButtons = [];
    const startX = 4;
    const btnW = 32;

    TOOLS.forEach((tool, i) => {
      const x = startX + i * (btnW + 2) + btnW / 2;
      const y = barY + 4;

      const btn = this.add.rectangle(x, y, btnW, 14, tool.color, 0.5);
      btn.setStrokeStyle(1, tool.id === this.currentTool ? 0xffffff : 0x333333);
      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => {
        this.waypointMode = false;
        this.currentTool = tool.id;
        this.updateToolbar();
      });

      const label = this.add.text(x, y, `${tool.key}:${tool.label}`, {
        fontSize: '5px', fontFamily: 'monospace', color: '#ffffff',
      }).setOrigin(0.5);

      this.toolbarContainer.add([btn, label]);
      this.toolButtons.push({ btn, tool });
    });

    // Waypoint mode button
    const wpX = startX + TOOLS.length * (btnW + 2) + btnW / 2 + 5;
    const wpBtn = this.add.rectangle(wpX, barY + 4, 36, 14, 0x8e44ad, 0.5);
    wpBtn.setStrokeStyle(1, 0x333333);
    wpBtn.setInteractive({ useHandCursor: true });
    wpBtn.on('pointerdown', () => this.toggleWaypointMode());
    const wpLabel = this.add.text(wpX, barY + 4, 'W:WPT', {
      fontSize: '5px', fontFamily: 'monospace', color: '#ffffff',
    }).setOrigin(0.5);
    this.toolbarContainer.add([wpBtn, wpLabel]);
    this.wpButton = wpBtn;
  }

  updateToolbar() {
    for (const { btn, tool } of this.toolButtons) {
      btn.setStrokeStyle(1, tool.id === this.currentTool && !this.waypointMode ? 0xffffff : 0x333333);
    }
    if (this.wpButton) {
      this.wpButton.setStrokeStyle(1, this.waypointMode ? 0xffffff : 0x333333);
    }
  }

  createTopBar() {
    this.topBarContainer = this.add.container(0, 0).setDepth(50);
    const bg = this.add.rectangle(GAME_WIDTH / 2, 7, GAME_WIDTH, 14, 0x0a0a1a, 0.85);
    this.topBarContainer.add(bg);

    // Title
    const title = this.add.text(5, 7, 'LEVEL EDITOR', {
      fontSize: '8px', fontFamily: 'monospace', color: '#ffd700',
    }).setOrigin(0, 0.5);
    this.topBarContainer.add(title);

    // Buttons
    const buttons = [
      { label: 'Auto(A)', x: 110, cb: () => this.autoTraceWaypoints() },
      { label: 'Test(T)', x: 155, cb: () => this.testPath() },
      { label: 'Export(E)', x: 205, cb: () => this.exportLevel() },
      { label: 'Grid(G)', x: 260, cb: () => this.toggleGrid() },
      { label: 'Clear(C)', x: 310, cb: () => this.clearMap() },
      { label: 'Undo(Z)', x: 355, cb: () => this.undo() },
    ];

    buttons.forEach(b => {
      const btn = this.add.text(b.x, 7, b.label, {
        fontSize: '6px', fontFamily: 'monospace', color: '#8a8aaa',
      }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => btn.setColor('#ffd700'));
      btn.on('pointerout', () => btn.setColor('#8a8aaa'));
      btn.on('pointerdown', b.cb);
      this.topBarContainer.add(btn);
    });

    // Load level dropdown
    const loadBtns = [];
    for (let i = 1; i <= 6; i++) {
      const btn = this.add.text(395 + (i - 1) * 14, 7, `${i}`, {
        fontSize: '7px', fontFamily: 'monospace', color: '#3498db',
      }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => btn.setColor('#ffd700'));
      btn.on('pointerout', () => btn.setColor('#3498db'));
      btn.on('pointerdown', () => {
        this.loadLevelId = i;
        this.loadLevel(i);
        this.renderFullMap();
        this.setStatus(`Loaded level ${i}`);
      });
      this.topBarContainer.add(btn);
    }

    const loadLabel = this.add.text(388, 7, 'L:', {
      fontSize: '6px', fontFamily: 'monospace', color: '#8a8aaa',
    }).setOrigin(0, 0.5);
    this.topBarContainer.add(loadLabel);

    // ESC to exit
    const exitBtn = this.add.text(GAME_WIDTH - 5, 7, 'ESC', {
      fontSize: '6px', fontFamily: 'monospace', color: '#e74c3c',
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    exitBtn.on('pointerdown', () => this.scene.start('MenuScene'));
    this.topBarContainer.add(exitBtn);
  }

  createWaypointOverlay() {
    // Info text about current mode
    this.modeText = this.add.text(GAME_WIDTH / 2, 20, '', {
      fontSize: '6px', fontFamily: 'monospace', color: '#bb6bd9',
      stroke: '#000', strokeThickness: 1,
    }).setOrigin(0.5).setDepth(55);
  }

  // === INPUT ===

  onPointerDown(pointer) {
    // Ignore if clicking on toolbar or top bar
    if (pointer.y < 14 || pointer.y > GAME_HEIGHT - 24) return;

    const gx = Math.floor(pointer.x / TILE_SIZE);
    const gy = Math.floor(pointer.y / TILE_SIZE);

    if (gx < 0 || gx >= GRID_COLS || gy < 0 || gy >= GRID_ROWS) return;

    if (this.waypointMode) {
      this.placeWaypoint(gx, gy);
    } else {
      // Save undo state
      this.pushUndo();
      this.paintTile(gx, gy);
      this.isDrawing = true;
    }
  }

  onPointerMove(pointer) {
    if (!this.isDrawing || this.waypointMode) return;
    if (pointer.y < 14 || pointer.y > GAME_HEIGHT - 24) return;

    const gx = Math.floor(pointer.x / TILE_SIZE);
    const gy = Math.floor(pointer.y / TILE_SIZE);

    if (gx < 0 || gx >= GRID_COLS || gy < 0 || gy >= GRID_ROWS) return;

    this.paintTile(gx, gy);
  }

  paintTile(gx, gy) {
    // For START and END, ensure only one exists
    if (this.currentTool === CELL.START || this.currentTool === CELL.END) {
      for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
          if (this.map[y][x] === this.currentTool) {
            this.map[y][x] = CELL.EMPTY;
          }
        }
      }
    }

    this.map[gy][gx] = this.currentTool;
    this.renderFullMap();
  }

  placeWaypoint(gx, gy) {
    const px = gx * TILE_SIZE + TILE_SIZE / 2;
    const py = gy * TILE_SIZE + TILE_SIZE / 2;

    // Check if clicking near an existing waypoint to remove it
    for (let i = this.manualWaypoints.length - 1; i >= 0; i--) {
      const wp = this.manualWaypoints[i];
      if (Math.abs(wp.x - px) < TILE_SIZE && Math.abs(wp.y - py) < TILE_SIZE) {
        this.manualWaypoints.splice(i, 1);
        this.drawWaypoints();
        this.setStatus(`Removed waypoint ${i}`);
        return;
      }
    }

    // Add new waypoint
    this.manualWaypoints.push({ x: px, y: py });
    this.drawWaypoints();
    this.setStatus(`Waypoint ${this.manualWaypoints.length - 1} placed at (${gx},${gy})`);
  }

  // === ACTIONS ===

  toggleWaypointMode() {
    this.waypointMode = !this.waypointMode;
    this.updateToolbar();
    this.modeText.setText(this.waypointMode ? 'WAYPOINT MODE: Click to add, click existing to remove' : '');
    this.setStatus(this.waypointMode ? 'Waypoint mode ON' : 'Paint mode');
  }

  autoTraceWaypoints() {
    const warnings = validateMap(this.map);
    if (warnings.length > 0) {
      this.setStatus('ERR: ' + warnings[0], '#e74c3c');
      return;
    }

    this.manualWaypoints = tracePathWaypoints(this.map);
    this.drawWaypoints();
    this.setStatus(`Auto-traced ${this.manualWaypoints.length} waypoints`, '#2ecc71');
  }

  testPath() {
    if (this.testRunning) {
      this.stopTest();
      return;
    }

    if (this.manualWaypoints.length < 2) {
      this.setStatus('Need at least 2 waypoints. Press A to auto-trace.', '#e74c3c');
      return;
    }

    this.testRunning = true;
    this.setStatus('Testing path... (T to stop)', '#f39c12');

    // Create a simple test dot that follows the waypoints
    const wps = this.manualWaypoints;
    this.testDot = this.add.circle(wps[0].x, wps[0].y, 4, 0xff0000, 1);
    this.testDot.setDepth(20);

    let wpIndex = 0;
    const speed = 50; // pixels per second

    this.testTimer = this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        if (wpIndex >= wps.length - 1) {
          this.stopTest();
          this.setStatus('Test complete! Path OK', '#2ecc71');
          return;
        }

        const target = wps[wpIndex + 1];
        const dx = target.x - this.testDot.x;
        const dy = target.y - this.testDot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 2) {
          wpIndex++;
        } else {
          this.testDot.x += (dx / dist) * speed * 0.016;
          this.testDot.y += (dy / dist) * speed * 0.016;
        }
      },
    });
  }

  stopTest() {
    this.testRunning = false;
    if (this.testDot) { this.testDot.destroy(); this.testDot = null; }
    if (this.testTimer) { this.testTimer.remove(); this.testTimer = null; }
  }

  toggleGrid() {
    this.showGrid = !this.showGrid;
    this.drawGrid();
    this.setStatus(this.showGrid ? 'Grid ON' : 'Grid OFF');
  }

  clearMap() {
    this.pushUndo();
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        this.map[y][x] = CELL.EMPTY;
      }
    }
    this.manualWaypoints = [];
    this.renderFullMap();
    this.setStatus('Map cleared');
  }

  pushUndo() {
    this.undoStack.push(this.map.map(row => [...row]));
    if (this.undoStack.length > 30) this.undoStack.shift();
  }

  undo() {
    if (this.undoStack.length === 0) {
      this.setStatus('Nothing to undo');
      return;
    }
    this.map = this.undoStack.pop();
    this.renderFullMap();
    this.setStatus('Undone');
  }

  exportLevel() {
    const warnings = validateMap(this.map);
    if (warnings.length > 0) {
      this.setStatus('WARN: ' + warnings.join(', '), '#f39c12');
    }

    const asciiRows = mapToAscii(this.map);
    const waypointsCode = this.manualWaypoints.map(
      w => `      { x: ${w.x}, y: ${w.y} },`
    ).join('\n');

    const mapCode = asciiRows.map(r => `      '${r}',`).join('\n');

    const output = `    map: parseMap([
${mapCode}
    ]),
    waypoints: [
${waypointsCode}
    ],`;

    // Copy to clipboard via a textarea hack
    const textArea = document.createElement('textarea');
    textArea.value = output;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      this.setStatus(`Exported! Copied to clipboard (${this.manualWaypoints.length} waypoints)`, '#2ecc71');
    } catch (e) {
      // Fallback: log to console
      console.log('=== LEVEL EXPORT ===');
      console.log(output);
      this.setStatus('Exported to console (Ctrl+Shift+J to see)', '#f39c12');
    }
    document.body.removeChild(textArea);
  }

  setStatus(msg, color = '#2ecc71') {
    this.statusText.setText(msg);
    this.statusText.setColor(color);

    // Auto-clear after 4 seconds
    if (this.statusTimer) this.statusTimer.remove();
    this.statusTimer = this.time.delayedCall(4000, () => {
      this.statusText.setText('');
    });
  }
}
