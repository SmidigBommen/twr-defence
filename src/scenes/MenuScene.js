import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../utils/constants.js';
import LeaderboardManager from '../managers/LeaderboardManager.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Background
    this.cameras.main.setBackgroundColor(COLORS.DARK_BG);

    // Animated stars
    this.stars = [];
    for (let i = 0; i < 40; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(0, 1) === 0 ? 1 : 0.5,
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.8)
      );
      this.stars.push(star);
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.1, 0.3),
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
      });
    }

    // Title
    this.add.text(cx, cy - 65, 'ARCANE', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#bb6bd9',
      stroke: '#1a1a2e',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(cx, cy - 38, 'DEFENDERS', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffd700',
      stroke: '#1a1a2e',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(cx, cy - 18, 'A Fantasy Tower Defence', {
      fontSize: '7px',
      fontFamily: 'monospace',
      color: '#8a8aaa',
    }).setOrigin(0.5);

    // Buttons
    this.createButton(cx, cy + 20, 'START GAME', () => {
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => {
        this.scene.start('LevelSelectScene');
      });
    });

    this.createButton(cx, cy + 45, 'LEADERBOARD', () => {
      this.showLeaderboard();
    });

    this.createButton(cx, cy + 70, 'HOW TO PLAY', () => {
      this.showHowToPlay();
    });

    this.createButton(cx, cy + 95, 'EDITOR', () => {
      window.location.href = './editor.html';
    });

    // Version
    this.add.text(GAME_WIDTH - 5, GAME_HEIGHT - 5, 'v1.0', {
      fontSize: '5px',
      fontFamily: 'monospace',
      color: '#4a4a6a',
    }).setOrigin(1);

    // Fade in
    this.cameras.main.fadeIn(500);

    // Leaderboard overlay (hidden)
    this.overlay = null;
  }

  createButton(x, y, text, callback) {
    const bg = this.add.rectangle(x, y, 120, 18, COLORS.UI_BORDER, 0.3);
    bg.setStrokeStyle(1, COLORS.UI_BORDER, 0.6);
    bg.setInteractive({ useHandCursor: true });

    const label = this.add.text(x, y, text, {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#ecf0f1',
    }).setOrigin(0.5);

    bg.on('pointerover', () => {
      bg.setFillStyle(COLORS.UI_HIGHLIGHT, 0.2);
      bg.setStrokeStyle(1, COLORS.UI_HIGHLIGHT, 0.8);
      label.setColor('#ffd700');
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(COLORS.UI_BORDER, 0.3);
      bg.setStrokeStyle(1, COLORS.UI_BORDER, 0.6);
      label.setColor('#ecf0f1');
    });

    bg.on('pointerdown', callback);

    return { bg, label };
  }

  showLeaderboard() {
    if (this.overlay) return;

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.overlay = this.add.container(0, 0);

    // Backdrop
    const backdrop = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
    backdrop.setInteractive();
    this.overlay.add(backdrop);

    // Panel
    const panel = this.add.rectangle(cx, cy, 200, 180, COLORS.DARK_BG, 0.95);
    panel.setStrokeStyle(1, COLORS.UI_HIGHLIGHT);
    this.overlay.add(panel);

    // Title
    const title = this.add.text(cx, cy - 78, 'LEADERBOARD', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffd700',
    }).setOrigin(0.5);
    this.overlay.add(title);

    // Scores
    const lb = new LeaderboardManager();
    const scores = lb.getTopScores(10);

    if (scores.length === 0) {
      const empty = this.add.text(cx, cy, 'No scores yet!\nPlay a level to get started.', {
        fontSize: '7px',
        fontFamily: 'monospace',
        color: '#8a8aaa',
        align: 'center',
      }).setOrigin(0.5);
      this.overlay.add(empty);
    } else {
      scores.forEach((entry, i) => {
        const y = cy - 55 + i * 13;
        const rank = this.add.text(cx - 85, y, `${i + 1}.`, {
          fontSize: '7px',
          fontFamily: 'monospace',
          color: i < 3 ? '#ffd700' : '#ecf0f1',
        });
        const name = this.add.text(cx - 70, y, entry.name.substring(0, 10), {
          fontSize: '7px',
          fontFamily: 'monospace',
          color: '#ecf0f1',
        });
        const score = this.add.text(cx + 85, y, entry.score.toString(), {
          fontSize: '7px',
          fontFamily: 'monospace',
          color: '#ffd700',
        }).setOrigin(1, 0);
        this.overlay.add([rank, name, score]);
      });
    }

    // Close button
    const closeBtn = this.add.text(cx, cy + 78, '[CLOSE]', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#e74c3c',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.overlay.destroy();
      this.overlay = null;
    });
    this.overlay.add(closeBtn);
  }

  showHowToPlay() {
    if (this.overlay) return;

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.overlay = this.add.container(0, 0);

    const backdrop = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
    backdrop.setInteractive();
    this.overlay.add(backdrop);

    const panel = this.add.rectangle(cx, cy, 240, 190, COLORS.DARK_BG, 0.95);
    panel.setStrokeStyle(1, COLORS.UI_HIGHLIGHT);
    this.overlay.add(panel);

    const title = this.add.text(cx, cy - 82, 'HOW TO PLAY', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffd700',
    }).setOrigin(0.5);
    this.overlay.add(title);

    const instructions = [
      'Click golden squares to build towers',
      'Each tower type has unique abilities',
      'Upgrade towers to make them stronger',
      'Stop enemies from reaching the castle!',
      '',
      'TOWERS:',
      'Arcane - Fast magic bolts',
      'Flame  - AoE fire damage + burn',
      'Frost  - Slows and freezes enemies',
      'Barracks - Blocks enemies on path',
      'Lightning - Chain damage',
      'Enchanter - Buffs nearby towers',
      '',
      'TIP: Use different towers for',
      'different enemy types!',
    ];

    instructions.forEach((line, i) => {
      const text = this.add.text(cx - 105, cy - 65 + i * 10, line, {
        fontSize: '6px',
        fontFamily: 'monospace',
        color: line.startsWith('TIP') ? '#ffd700' : '#ecf0f1',
      });
      this.overlay.add(text);
    });

    const closeBtn = this.add.text(cx, cy + 85, '[CLOSE]', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#e74c3c',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.overlay.destroy();
      this.overlay = null;
    });
    this.overlay.add(closeBtn);
  }
}
