import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, CELL, TOWER_TYPES, GRID_COLS, GRID_ROWS } from '../utils/constants.js';
import { LEVELS } from '../data/levels.js';
import { TOWER_DATA, TOWER_UNLOCKS } from '../data/towers.js';
import Tower from '../entities/Tower.js';
import WaveManager from '../managers/WaveManager.js';
import EconomyManager from '../managers/EconomyManager.js';
import { tracePathWaypoints } from '../utils/pathTracer.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.levelId = data.levelId || 1;
  }

  create() {
    let level;

    // Check for custom level from editor (one-shot: cleared after loading)
    const params = new URLSearchParams(window.location.search);
    if (params.get('customLevel') === 'true') {
      try {
        const raw = localStorage.getItem('td_editor_temp_level');
        if (raw) {
          const custom = JSON.parse(raw);
          level = {
            id: 99,
            name: custom.name || 'Custom Level',
            startingGold: custom.startingGold || 120,
            lives: custom.lives || 20,
            map: custom.map,
            waypoints: custom.waypoints || [],
            waves: LEVELS[0].waves, // default to level 1 waves
          };
        }
      } catch (e) {
        console.warn('Failed to load custom level:', e);
      }
      // Clear so subsequent levels load campaign data
      localStorage.removeItem('td_editor_temp_level');
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (!level) {
      level = LEVELS.find(l => l.id === this.levelId);
    }

    if (!level) {
      this.scene.start('LevelSelectScene');
      return;
    }
    this.levelData = level;

    // Game state
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.selectedTower = null;
    this.buildMode = null;
    this.paused = false;
    this.gameSpeed = 1;
    this.gameOver = false;

    // Auto-trace waypoints from map tiles (replaces hand-coded waypoints)
    const waypoints = tracePathWaypoints(level.map);
    this.waypoints = waypoints.length >= 2 ? waypoints : level.waypoints;

    // Managers
    this.economy = new EconomyManager(this, level.startingGold, level.lives);
    this.waveManager = new WaveManager(this, level.waves, this.waypoints);

    // Render map
    this.renderMap(level.map);

    // Draw path indicators
    this.drawPathArrows(this.waypoints);

    // HUD
    this.createHUD();

    // Tower build panel
    this.createBuildPanel();

    // Tower info panel (hidden)
    this.towerInfoPanel = null;

    // Event listeners
    this.events.on('enemyKilled', this.onEnemyKilled, this);
    this.events.on('enemyReachedEnd', this.onEnemyReachedEnd, this);
    this.events.on('waveStarted', this.onWaveStarted, this);
    this.events.on('waveComplete', this.onWaveComplete, this);
    this.events.on('allWavesComplete', this.onAllWavesComplete, this);
    this.events.on('goldChanged', this.updateHUD, this);
    this.events.on('livesChanged', this.updateHUD, this);
    this.events.on('towerSelected', this.onTowerSelected, this);
    this.events.on('gameOver', this.onGameOver, this);

    // Click handler for map
    this.input.on('pointerdown', this.onMapClick, this);

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-SPACE', () => this.togglePause());
    this.input.keyboard.on('keydown-ESC', () => this.deselectAll());

    // Meteor strike ability
    this.meteorCooldown = 0;
    this.meteorMaxCooldown = 45000; // 45 seconds

    // Fade in
    this.cameras.main.fadeIn(500);
    this.cameras.main.setBackgroundColor(COLORS.DARK_BG);
  }

  renderMap(map) {
    this.mapTiles = [];
    const treeVariants = ['tile_trees', 'tile_trees2', 'tile_trees3'];

    // Fill entire background with grass first (prevents dark gaps)
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        const bg = this.add.image(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          'tile_grass'
        );
        bg.setDisplaySize(TILE_SIZE, TILE_SIZE);
        bg.setDepth(0);
      }
    }

    const tileTextures = {
      [CELL.PATH]: 'tile_path',
      [CELL.BUILD]: 'tile_build',
      [CELL.WATER]: 'tile_water',
      [CELL.ROCKS]: 'tile_rocks',
      [CELL.START]: 'tile_path',
      [CELL.END]: 'tile_castle',
      [CELL.BRIDGE]: 'tile_path',
    };

    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const cellType = map[y][x];
        if (cellType === CELL.EMPTY) continue; // Already grass

        let textureKey;
        if (cellType === CELL.TREES) {
          // Random tree variant seeded by position for consistency
          textureKey = treeVariants[(x * 7 + y * 13) % treeVariants.length];
        } else {
          textureKey = tileTextures[cellType] || 'tile_grass';
        }

        const tile = this.add.image(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          textureKey
        );
        tile.setDisplaySize(TILE_SIZE, TILE_SIZE);
        tile.setDepth(1);

        // Path edge darkening for depth
        if (cellType === CELL.PATH || cellType === CELL.START || cellType === CELL.BRIDGE) {
          tile.setDepth(1);
        }

        // Castle glow effect
        if (cellType === CELL.END) {
          tile.setDepth(2);
          const glow = this.add.circle(
            x * TILE_SIZE + TILE_SIZE / 2,
            y * TILE_SIZE + TILE_SIZE / 2,
            12, 0xffd700, 0.15
          );
          glow.setDepth(1);
          this.tweens.add({
            targets: glow,
            alpha: 0.05,
            duration: 1500,
            yoyo: true,
            repeat: -1,
          });
        }

        this.mapTiles.push({ tile, x, y, type: cellType });
      }
    }
  }

  drawPathArrows(waypoints) {
    // Draw subtle arrows along the path to show direction
    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i];
      const to = waypoints[i + 1];
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      const angle = Math.atan2(to.y - from.y, to.x - from.x);

      const arrow = this.add.text(midX, midY, '>', {
        fontSize: '6px',
        fontFamily: 'monospace',
        color: '#8b6914',
      });
      arrow.setOrigin(0.5);
      arrow.setRotation(angle);
      arrow.setAlpha(0.4);
      arrow.setDepth(1);
    }
  }

  createHUD() {
    const hudH = 18;
    const hudY = hudH / 2;

    // Top HUD bar
    this.hudBg = this.add.rectangle(GAME_WIDTH / 2, hudY, GAME_WIDTH, hudH, 0x000000, 0.7);
    this.hudBg.setDepth(30);

    // Gold
    this.goldIcon = this.add.image(10, hudY, 'icon_coin');
    this.goldIcon.setScale(0.5);
    this.goldIcon.setDepth(31);
    this.goldText = this.add.text(20, hudY, `${this.economy.gold}`, {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0, 0.5).setDepth(31);

    // Lives
    this.livesIcon = this.add.image(75, hudY, 'icon_heart');
    this.livesIcon.setScale(0.5);
    this.livesIcon.setDepth(31);
    this.livesText = this.add.text(85, hudY, `${this.economy.lives}`, {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#e74c3c',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0, 0.5).setDepth(31);

    // Wave counter
    this.waveText = this.add.text(140, hudY,
      `Wave 0/${this.waveManager.getTotalWaves()}`, {
        fontSize: '9px',
        fontFamily: 'monospace',
        color: '#ecf0f1',
        stroke: '#000000',
        strokeThickness: 1,
      }).setOrigin(0, 0.5).setDepth(31);

    // Score
    this.scoreText = this.add.text(250, hudY, `Score: 0`, {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#bb6bd9',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0, 0.5).setDepth(31);

    // Speed button with background
    this.speedBtnBg = this.add.rectangle(GAME_WIDTH - 56, hudY, 26, 12, 0x27ae60, 0.6);
    this.speedBtnBg.setStrokeStyle(1, 0x2ecc71, 0.8);
    this.speedBtnBg.setDepth(31);
    this.speedBtnBg.setInteractive({ useHandCursor: true });
    this.speedBtn = this.add.text(GAME_WIDTH - 56, hudY, '1x', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(32);
    this.speedBtnBg.on('pointerdown', () => this.toggleSpeed());

    // Pause button with background
    this.pauseBtnBg = this.add.rectangle(GAME_WIDTH - 30, hudY, 18, 12, 0x4a4a6a, 0.6);
    this.pauseBtnBg.setStrokeStyle(1, 0x6a6a8a, 0.8);
    this.pauseBtnBg.setDepth(31);
    this.pauseBtnBg.setInteractive({ useHandCursor: true });
    this.pauseBtn = this.add.text(GAME_WIDTH - 30, hudY, '||', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#ecf0f1',
    }).setOrigin(0.5).setDepth(32);
    this.pauseBtnBg.on('pointerdown', () => this.togglePause());

    // Menu/quit button with background
    this.menuBtnBg = this.add.rectangle(GAME_WIDTH - 12, hudY, 18, 12, 0x8b1a1a, 0.6);
    this.menuBtnBg.setStrokeStyle(1, 0xc0392b, 0.8);
    this.menuBtnBg.setDepth(31);
    this.menuBtnBg.setInteractive({ useHandCursor: true });
    this.menuBtnText = this.add.text(GAME_WIDTH - 12, hudY, 'X', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#e74c3c',
    }).setOrigin(0.5).setDepth(32);
    this.menuBtnBg.on('pointerdown', () => {
      this.scene.start('LevelSelectScene');
    });

    // Start wave button (bottom center)
    this.startWaveBtn = this.createStartWaveButton();

    // Meteor ability button (bottom left) with proper styling
    const meteorX = 35;
    const meteorY = GAME_HEIGHT - 12;
    this.meteorBtnBg = this.add.rectangle(meteorX, meteorY, 56, 14, 0x8b1a1a, 0.7);
    this.meteorBtnBg.setStrokeStyle(1, 0xff6b35, 0.8);
    this.meteorBtnBg.setDepth(30);
    this.meteorBtnBg.setInteractive({ useHandCursor: true });
    this.meteorBtn = this.add.text(meteorX, meteorY, 'METEOR', {
      fontSize: '7px',
      fontFamily: 'monospace',
      color: '#ff6b35',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5).setDepth(31);
    this.meteorBtnBg.on('pointerdown', () => this.activateMeteor());
  }

  createStartWaveButton() {
    const x = GAME_WIDTH / 2;
    const y = GAME_HEIGHT - 12;

    const bg = this.add.rectangle(x, y, 80, 14, 0x27ae60, 0.8);
    bg.setStrokeStyle(1, 0x2ecc71);
    bg.setDepth(30);
    bg.setInteractive({ useHandCursor: true });

    const text = this.add.text(x, y, 'SEND WAVE', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(31);

    bg.on('pointerover', () => {
      bg.setFillStyle(0x2ecc71, 0.9);
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(0x27ae60, 0.8);
    });
    bg.on('pointerdown', () => {
      if (!this.waveManager.waveActive) {
        this.waveManager.startNextWave();
        bg.setVisible(false);
        text.setVisible(false);
      }
    });

    return { bg, text };
  }

  createBuildPanel() {
    // Build panel shows when clicking a build spot
    this.buildPanel = null;
  }

  showBuildMenu(gridX, gridY) {
    this.closeBuildMenu();
    this.closeTowerInfo();

    const x = gridX * TILE_SIZE + TILE_SIZE / 2;
    const y = gridY * TILE_SIZE + TILE_SIZE / 2;

    this.buildPanel = this.add.container(0, 0);
    this.buildPanel.setDepth(40);

    // Get available towers for this level
    const availableTowers = Object.entries(TOWER_UNLOCKS)
      .filter(([_, unlockLevel]) => unlockLevel <= this.levelId)
      .map(([type]) => type);

    const panelW = 75;
    const panelH = availableTowers.length * 18 + 8;

    // Position panel (avoid going off screen)
    let panelX = x + 16;
    let panelY = y - panelH / 2;
    if (panelX + panelW > GAME_WIDTH) panelX = x - panelW - 8;
    if (panelY < 15) panelY = 15;
    if (panelY + panelH > GAME_HEIGHT) panelY = GAME_HEIGHT - panelH;

    // Background
    const bg = this.add.rectangle(panelX + panelW / 2, panelY + panelH / 2, panelW, panelH, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(1, COLORS.UI_HIGHLIGHT);
    this.buildPanel.add(bg);

    // Tower options
    availableTowers.forEach((type, i) => {
      const data = TOWER_DATA[type];
      const btnY = panelY + 8 + i * 18;
      const canAfford = this.economy.canAfford(data.cost);

      const btnBg = this.add.rectangle(panelX + panelW / 2, btnY + 6, panelW - 6, 16,
        canAfford ? 0x2a3a5a : 0x1a1a1a, 0.8
      );
      btnBg.setStrokeStyle(1, canAfford ? 0x4a6a8a : 0x333333);

      if (canAfford) {
        btnBg.setInteractive({ useHandCursor: true });
        btnBg.on('pointerover', () => {
          btnBg.setFillStyle(0x3a4a6a, 0.9);
          // Show range preview
          this.showRangePreview(x, y, data.levels[0].range);
        });
        btnBg.on('pointerout', () => {
          btnBg.setFillStyle(0x2a3a5a, 0.8);
          this.hideRangePreview();
        });
        btnBg.on('pointerdown', () => {
          this.buildTower(type, gridX, gridY);
        });
      }

      // Tower icon (small)
      const icon = this.add.image(panelX + 10, btnY + 6, data.icon);
      icon.setScale(0.5);

      // Name + cost
      const name = this.add.text(panelX + 20, btnY + 2, data.name.substring(0, 8), {
        fontSize: '5px',
        fontFamily: 'monospace',
        color: canAfford ? '#ecf0f1' : '#555555',
      });

      const cost = this.add.text(panelX + panelW - 5, btnY + 2, `${data.cost}g`, {
        fontSize: '5px',
        fontFamily: 'monospace',
        color: canAfford ? '#ffd700' : '#555555',
      }).setOrigin(1, 0);

      this.buildPanel.add([btnBg, icon, name, cost]);
    });

    // Close on right-click or pressing escape
    this.buildSpotSelected = { x: gridX, y: gridY };
  }

  showRangePreview(x, y, range) {
    this.hideRangePreview();
    this.rangePreview = this.add.circle(x, y, range, 0xffffff, 0.1);
    this.rangePreview.setStrokeStyle(1, 0xffffff, 0.3);
    this.rangePreview.setDepth(3);
  }

  hideRangePreview() {
    if (this.rangePreview) {
      this.rangePreview.destroy();
      this.rangePreview = null;
    }
  }

  closeBuildMenu() {
    if (this.buildPanel) {
      this.buildPanel.destroy();
      this.buildPanel = null;
    }
    this.hideRangePreview();
    this.buildSpotSelected = null;
  }

  buildTower(type, gridX, gridY) {
    const data = TOWER_DATA[type];
    if (!this.economy.spend(data.cost)) return;

    const tower = new Tower(this, type, gridX, gridY);
    this.towers.push(tower);

    // Mark build spot as occupied
    this.occupiedSpots = this.occupiedSpots || new Set();
    this.occupiedSpots.add(`${gridX},${gridY}`);

    this.closeBuildMenu();

    // Sound-like visual feedback
    this.cameras.main.shake(50, 0.002);
  }

  showTowerInfo(tower) {
    this.closeTowerInfo();
    this.closeBuildMenu();

    tower.showRange();
    this.selectedTower = tower;

    const x = tower.x;
    const y = tower.y;
    const data = tower.data;
    const stats = tower.getStats();

    const panelW = 85;
    const panelH = 65;

    let panelX = x + 16;
    let panelY = y - panelH / 2;
    if (panelX + panelW > GAME_WIDTH) panelX = x - panelW - 8;
    if (panelY < 15) panelY = 15;
    if (panelY + panelH > GAME_HEIGHT) panelY = GAME_HEIGHT - panelH;

    this.towerInfoPanel = this.add.container(0, 0);
    this.towerInfoPanel.setDepth(40);

    const bg = this.add.rectangle(panelX + panelW / 2, panelY + panelH / 2, panelW, panelH, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(1, COLORS.UI_HIGHLIGHT);
    this.towerInfoPanel.add(bg);

    // Tower name & level
    const name = this.add.text(panelX + 5, panelY + 3, `${data.name} Lv.${tower.level + 1}`, {
      fontSize: '6px',
      fontFamily: 'monospace',
      color: '#ffd700',
    });
    this.towerInfoPanel.add(name);

    // Stats
    const statLines = [];
    if (stats.damage) statLines.push(`DMG: ${Math.floor(tower.getDamage())}`);
    if (stats.range) statLines.push(`RNG: ${Math.floor(tower.getRange())}`);
    if (stats.fireRate) statLines.push(`SPD: ${(1000 / stats.fireRate).toFixed(1)}/s`);
    if (stats.soldierDamage) statLines.push(`SOL DMG: ${stats.soldierDamage}`);
    if (stats.damageBoost) statLines.push(`BUFF: +${Math.floor(stats.damageBoost * 100)}%`);

    statLines.forEach((line, i) => {
      const text = this.add.text(panelX + 5, panelY + 13 + i * 8, line, {
        fontSize: '5px',
        fontFamily: 'monospace',
        color: '#ecf0f1',
      });
      this.towerInfoPanel.add(text);
    });

    // Buttons
    const btnY = panelY + panelH - 14;

    // Upgrade button
    if (tower.canUpgrade()) {
      const cost = tower.getUpgradeCost();
      const canAfford = this.economy.canAfford(cost);
      const upgBtn = this.add.rectangle(panelX + 22, btnY, 38, 11,
        canAfford ? 0x27ae60 : 0x333333, 0.8
      );
      upgBtn.setStrokeStyle(1, canAfford ? 0x2ecc71 : 0x444444);
      if (canAfford) {
        upgBtn.setInteractive({ useHandCursor: true });
        upgBtn.on('pointerdown', () => {
          if (this.economy.spend(cost)) {
            tower.upgrade();
            this.showTowerInfo(tower);
          }
        });
      }
      const upgText = this.add.text(panelX + 22, btnY, `UP ${cost}g`, {
        fontSize: '5px',
        fontFamily: 'monospace',
        color: canAfford ? '#ffffff' : '#555555',
      }).setOrigin(0.5);
      this.towerInfoPanel.add([upgBtn, upgText]);
    }

    // Sell button
    const sellValue = tower.getSellValue();
    const sellBtn = this.add.rectangle(panelX + panelW - 22, btnY, 38, 11, 0xc0392b, 0.8);
    sellBtn.setStrokeStyle(1, 0xe74c3c);
    sellBtn.setInteractive({ useHandCursor: true });
    sellBtn.on('pointerdown', () => {
      this.sellTower(tower);
    });
    const sellText = this.add.text(panelX + panelW - 22, btnY, `SELL ${sellValue}g`, {
      fontSize: '5px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.towerInfoPanel.add([sellBtn, sellText]);
  }

  closeTowerInfo() {
    if (this.towerInfoPanel) {
      this.towerInfoPanel.destroy();
      this.towerInfoPanel = null;
    }
    if (this.selectedTower) {
      this.selectedTower.hideRange();
      this.selectedTower = null;
    }
  }

  sellTower(tower) {
    const value = tower.sell();
    this.economy.earn(value);

    // Remove from occupied spots
    if (this.occupiedSpots) {
      this.occupiedSpots.delete(`${tower.gridX},${tower.gridY}`);
    }

    // Remove from towers array
    this.towers = this.towers.filter(t => t !== tower);
    this.closeTowerInfo();
  }

  onMapClick(pointer) {
    if (this.gameOver) return;
    if (this.paused) return;

    // Check if clicking on UI elements (top HUD or bottom buttons)
    if (pointer.y < 18 || pointer.y > GAME_HEIGHT - 20) return;

    // Check if meteor mode is active
    if (this.meteorActive) {
      this.castMeteor(pointer.x, pointer.y);
      return;
    }

    // Get grid position
    const gridX = Math.floor(pointer.x / TILE_SIZE);
    const gridY = Math.floor(pointer.y / TILE_SIZE);

    // Check if clicking on existing tower
    const existingTower = this.towers.find(t => t.gridX === gridX && t.gridY === gridY);
    if (existingTower) {
      this.showTowerInfo(existingTower);
      return;
    }

    // Check if clicking on build spot
    if (this.isBuildSpot(gridX, gridY) && !this.isOccupied(gridX, gridY)) {
      this.showBuildMenu(gridX, gridY);
      return;
    }

    // Clicked elsewhere - deselect
    this.deselectAll();
  }

  onTowerSelected(tower) {
    this.showTowerInfo(tower);
  }

  isBuildSpot(gridX, gridY) {
    if (!this.levelData.map[gridY]) return false;
    return this.levelData.map[gridY][gridX] === CELL.BUILD;
  }

  isOccupied(gridX, gridY) {
    if (!this.occupiedSpots) return false;
    return this.occupiedSpots.has(`${gridX},${gridY}`);
  }

  deselectAll() {
    this.closeBuildMenu();
    this.closeTowerInfo();
    this.meteorActive = false;
  }

  togglePause() {
    this.paused = !this.paused;
    this.pauseBtn.setText(this.paused ? '>' : '||');
    this.pauseBtnBg.setFillStyle(this.paused ? 0x8b1a1a : 0x4a4a6a, 0.6);

    if (this.paused) {
      this.pauseOverlay = this.add.rectangle(
        GAME_WIDTH / 2, GAME_HEIGHT / 2,
        GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5
      );
      this.pauseOverlay.setDepth(50);
      this.pauseText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'PAUSED', {
        fontSize: '18px',
        fontFamily: 'monospace',
        color: '#ecf0f1',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5).setDepth(51);
    } else {
      if (this.pauseOverlay) this.pauseOverlay.destroy();
      if (this.pauseText) this.pauseText.destroy();
    }
  }

  toggleSpeed() {
    if (this.gameSpeed === 1) {
      this.gameSpeed = 2;
      this.speedBtn.setText('2x');
      this.speedBtnBg.setFillStyle(0xf39c12, 0.6);
    } else {
      this.gameSpeed = 1;
      this.speedBtn.setText('1x');
      this.speedBtnBg.setFillStyle(0x27ae60, 0.6);
    }
  }

  activateMeteor() {
    if (this.meteorCooldown > 0) return;
    this.meteorActive = true;
    this.meteorBtn.setColor('#ffff00');
    this.meteorBtnBg.setStrokeStyle(1, 0xffff00, 1);
  }

  castMeteor(x, y) {
    this.meteorActive = false;
    this.meteorCooldown = this.meteorMaxCooldown;
    this.meteorBtn.setColor('#555555');
    this.meteorBtnBg.setStrokeStyle(1, 0x555555, 0.5);
    this.meteorBtnBg.setFillStyle(0x333333, 0.5);

    // Meteor visual
    this.cameras.main.shake(300, 0.008);

    // Flash (use scale tween for circle)
    const flash = this.add.circle(x, y, 30, 0xff6b35, 0.6);
    flash.setDepth(25);
    this.tweens.add({
      targets: flash,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy(),
    });

    // Damage enemies in radius
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (dist <= 35) {
        const damage = 50 * (1 - dist / 50);
        enemy.takeDamage(Math.max(20, damage));
        enemy.applyStatusEffect('burn', { dps: 5, remaining: 3000 });
      }
    }

    // Particles
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 25;
      const p = this.add.circle(
        x + Math.cos(angle) * dist,
        y + Math.sin(angle) * dist,
        Phaser.Math.Between(1, 3),
        Phaser.Math.RND.pick([0xff6b35, 0xe74c3c, 0xf39c12]),
        1
      );
      p.setDepth(26);
      this.tweens.add({
        targets: p,
        x: p.x + Math.cos(angle) * 30,
        y: p.y + Math.sin(angle) * 30 - 10,
        alpha: 0,
        duration: Phaser.Math.Between(400, 800),
        onComplete: () => p.destroy(),
      });
    }
  }

  onEnemyKilled(enemy) {
    this.economy.addKill(enemy);
    this.updateHUD();
  }

  onEnemyReachedEnd(enemy) {
    this.economy.loseLife(enemy.damage);
    this.cameras.main.shake(200, 0.005);

    // Red flash
    this.cameras.main.flash(200, 200, 50, 50, false);

    this.updateHUD();
  }

  onWaveStarted(waveNum) {
    // Wave announcement
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, `WAVE ${waveNum}`, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2,
    });
    text.setOrigin(0.5);
    text.setDepth(45);
    text.setAlpha(0);

    this.tweens.add({
      targets: text,
      alpha: 1,
      y: text.y - 10,
      duration: 500,
      hold: 1000,
      yoyo: true,
      onComplete: () => text.destroy(),
    });

    this.updateHUD();
  }

  onWaveComplete(waveNum) {
    this.economy.completeWave();

    // Show wave complete + bonus
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'WAVE COMPLETE!', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#2ecc71',
      stroke: '#000000',
      strokeThickness: 2,
    });
    text.setOrigin(0.5).setDepth(45);

    const bonusText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 14, `+25 Gold`, {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 1,
    });
    bonusText.setOrigin(0.5).setDepth(45);

    this.tweens.add({
      targets: [text, bonusText],
      alpha: 0,
      y: '-=15',
      duration: 2000,
      delay: 800,
      onComplete: () => {
        text.destroy();
        bonusText.destroy();
      },
    });

    // Show start wave button
    this.startWaveBtn.bg.setVisible(true);
    this.startWaveBtn.text.setVisible(true);

    this.updateHUD();
  }

  onAllWavesComplete() {
    this.economy.completeLevel();
    this.gameOver = true;

    // Victory!
    this.time.delayedCall(1000, () => {
      this.cameras.main.fadeOut(800);
      this.time.delayedCall(800, () => {
        this.scene.start('GameOverScene', {
          victory: true,
          score: this.economy.score,
          levelId: this.levelId,
          lives: this.economy.lives,
          maxLives: this.economy.maxLives,
          wavesCompleted: this.waveManager.getCurrentWaveNumber() - 1,
          totalWaves: this.waveManager.getTotalWaves(),
        });
      });
    });
  }

  onGameOver(victory) {
    if (this.gameOver) return;
    this.gameOver = true;

    if (!victory) {
      // Defeat
      this.cameras.main.shake(500, 0.01);
      this.time.delayedCall(1500, () => {
        this.cameras.main.fadeOut(800);
        this.time.delayedCall(800, () => {
          this.scene.start('GameOverScene', {
            victory: false,
            score: this.economy.score,
            levelId: this.levelId,
            lives: 0,
            maxLives: this.economy.maxLives,
            wavesCompleted: this.waveManager.getCurrentWaveNumber() - 1,
            totalWaves: this.waveManager.getTotalWaves(),
          });
        });
      });
    }
  }

  updateHUD() {
    if (this.goldText) this.goldText.setText(`${this.economy.gold}`);
    if (this.livesText) this.livesText.setText(`${this.economy.lives}`);
    if (this.waveText) {
      this.waveText.setText(
        `Wave: ${this.waveManager.getCurrentWaveNumber()}/${this.waveManager.getTotalWaves()}`
      );
    }
    if (this.scoreText) this.scoreText.setText(`Score: ${this.economy.score}`);
  }

  update(time, delta) {
    if (this.paused || this.gameOver) return;

    const adjustedDelta = delta * this.gameSpeed;

    // Update wave manager
    this.waveManager.update(adjustedDelta);

    // Update enemies
    for (const enemy of this.enemies) {
      if (enemy.alive) {
        enemy.update(adjustedDelta);
      }
    }

    // Clean up dead enemies
    this.enemies = this.enemies.filter(e => e.alive);

    // Reset tower buffs each frame (enchanter will reapply)
    for (const tower of this.towers) {
      tower.damageMultiplier = 1;
      tower.rangeMultiplier = 1;
      if (!tower.isSupport) tower.canReveal = false;
    }

    // Reset stealth reveal each frame (enchanter will reapply)
    for (const enemy of this.enemies) {
      if (enemy.isStealth && enemy.alive) {
        enemy.revealed = false;
      }
    }

    // Update towers
    for (const tower of this.towers) {
      tower.update(adjustedDelta);
    }

    // Update projectiles
    for (const proj of this.projectiles) {
      if (proj.alive) {
        proj.update(adjustedDelta);
      }
    }
    this.projectiles = this.projectiles.filter(p => p.alive);

    // Check wave completion
    this.waveManager.checkWaveComplete();

    // Update meteor cooldown
    if (this.meteorCooldown > 0) {
      this.meteorCooldown -= adjustedDelta;
      if (this.meteorCooldown <= 0) {
        this.meteorCooldown = 0;
        this.meteorBtn.setColor('#ff6b35');
        this.meteorBtnBg.setStrokeStyle(1, 0xff6b35, 0.8);
        this.meteorBtnBg.setFillStyle(0x8b1a1a, 0.7);
      }
    }

    // Update HUD periodically
    this.updateHUD();
  }
}
