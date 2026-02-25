import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../utils/constants.js';
import { LEVELS, getUnlockedLevels } from '../data/levels.js';

export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelectScene');
  }

  create() {
    const cx = GAME_WIDTH / 2;

    this.cameras.main.setBackgroundColor(COLORS.DARK_BG);
    this.cameras.main.fadeIn(400);

    // Title
    this.add.text(cx, 20, 'SELECT LEVEL', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffd700',
      stroke: '#1a1a2e',
      strokeThickness: 2,
    }).setOrigin(0.5);

    const unlocked = getUnlockedLevels();

    // Level cards - 3 columns, 2 rows
    const cols = 3;
    const cardW = 120;
    const cardH = 80;
    const gapX = 15;
    const gapY = 15;
    const startX = cx - ((cols * cardW + (cols - 1) * gapX) / 2) + cardW / 2;
    const startY = 55;

    LEVELS.forEach((level, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);
      const isUnlocked = unlocked.includes(level.id);

      this.createLevelCard(x, y, cardW, cardH, level, isUnlocked);
    });

    // Back button
    const backBtn = this.add.text(10, GAME_HEIGHT - 15, '< BACK', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#e74c3c',
    }).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#ff6b6b'));
    backBtn.on('pointerout', () => backBtn.setColor('#e74c3c'));
    backBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => {
        this.scene.start('MenuScene');
      });
    });
  }

  createLevelCard(x, y, w, h, level, isUnlocked) {
    // Card background
    const bg = this.add.rectangle(x, y, w, h,
      isUnlocked ? 0x1a2a4a : 0x0a0a1a, 0.8
    );
    bg.setStrokeStyle(1, isUnlocked ? COLORS.UI_HIGHLIGHT : 0x333333);

    if (isUnlocked) {
      bg.setInteractive({ useHandCursor: true });

      bg.on('pointerover', () => {
        bg.setStrokeStyle(2, COLORS.UI_HIGHLIGHT);
        bg.setFillStyle(0x2a3a5a, 0.9);
      });

      bg.on('pointerout', () => {
        bg.setStrokeStyle(1, COLORS.UI_HIGHLIGHT);
        bg.setFillStyle(0x1a2a4a, 0.8);
      });

      bg.on('pointerdown', () => {
        this.cameras.main.fadeOut(400);
        this.time.delayedCall(400, () => {
          this.scene.start('GameScene', { levelId: level.id });
        });
      });
    }

    // Level number
    this.add.text(x - w / 2 + 6, y - h / 2 + 5, `LV.${level.id}`, {
      fontSize: '7px',
      fontFamily: 'monospace',
      color: isUnlocked ? '#ffd700' : '#333333',
    });

    // Level name
    this.add.text(x, y - 8, level.name, {
      fontSize: '7px',
      fontFamily: 'monospace',
      color: isUnlocked ? '#ecf0f1' : '#333333',
    }).setOrigin(0.5);

    // Description
    this.add.text(x, y + 5, level.description.substring(0, 35), {
      fontSize: '5px',
      fontFamily: 'monospace',
      color: isUnlocked ? '#8a8aaa' : '#222222',
      wordWrap: { width: w - 12 },
    }).setOrigin(0.5, 0);

    // Waves info
    this.add.text(x, y + h / 2 - 10, `${level.waves.length} waves`, {
      fontSize: '6px',
      fontFamily: 'monospace',
      color: isUnlocked ? '#4a8c3f' : '#222222',
    }).setOrigin(0.5);

    // Lock icon for locked levels
    if (!isUnlocked) {
      this.add.text(x, y - 5, 'LOCKED', {
        fontSize: '8px',
        fontFamily: 'monospace',
        color: '#333333',
      }).setOrigin(0.5);
    }
  }
}
