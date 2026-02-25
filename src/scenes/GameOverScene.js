import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../utils/constants.js';
import { unlockLevel, LEVELS } from '../data/levels.js';
import LeaderboardManager from '../managers/LeaderboardManager.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.victory = data.victory;
    this.score = data.score || 0;
    this.levelId = data.levelId || 1;
    this.lives = data.lives || 0;
    this.maxLives = data.maxLives || 20;
    this.wavesCompleted = data.wavesCompleted || 0;
    this.totalWaves = data.totalWaves || 0;
  }

  create() {
    const cx = GAME_WIDTH / 2;
    this.cameras.main.setBackgroundColor(COLORS.DARK_BG);
    this.cameras.main.fadeIn(500);

    // Star rating based on lives remaining
    const lifePercent = this.lives / this.maxLives;
    this.starCount = this.victory ? (lifePercent >= 0.9 ? 3 : lifePercent >= 0.5 ? 2 : 1) : 0;

    if (this.victory) {
      this.createVictoryScreen(cx);
      unlockLevel(this.levelId + 1);
    } else {
      this.createDefeatScreen(cx);
    }

    // Animated background particles
    this.createBackgroundParticles();
  }

  createVictoryScreen(cx) {
    // Victory title with glow
    const title = this.add.text(cx, 25, 'VICTORY!', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffd700',
      stroke: '#8b6914',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Pulse the title
    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Level name
    const level = LEVELS.find(l => l.id === this.levelId);
    this.add.text(cx, 48, level ? level.name : `Level ${this.levelId}`, {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#8a8aaa',
    }).setOrigin(0.5);

    // Star rating
    this.createStars(cx, 66);

    // Stats panel
    const panelY = 95;
    const panelBg = this.add.rectangle(cx, panelY, 160, 50, 0x1a2a4a, 0.6);
    panelBg.setStrokeStyle(1, 0x4a6a8a, 0.5);

    this.add.text(cx - 70, panelY - 18, 'SCORE', {
      fontSize: '6px', fontFamily: 'monospace', color: '#8a8aaa',
    });
    this.add.text(cx + 70, panelY - 18, `${this.score}`, {
      fontSize: '9px', fontFamily: 'monospace', color: '#ffd700',
    }).setOrigin(1, 0);

    this.add.text(cx - 70, panelY - 4, 'WAVES', {
      fontSize: '6px', fontFamily: 'monospace', color: '#8a8aaa',
    });
    this.add.text(cx + 70, panelY - 4, `${this.wavesCompleted}/${this.totalWaves}`, {
      fontSize: '9px', fontFamily: 'monospace', color: '#2ecc71',
    }).setOrigin(1, 0);

    this.add.text(cx - 70, panelY + 10, 'LIVES', {
      fontSize: '6px', fontFamily: 'monospace', color: '#8a8aaa',
    });
    this.add.text(cx + 70, panelY + 10, `${this.lives}/${this.maxLives}`, {
      fontSize: '9px', fontFamily: 'monospace', color: '#e74c3c',
    }).setOrigin(1, 0);

    // Name entry
    this.createNameEntry(cx, 140);

    // Action buttons
    this.createActionButtons(cx, 195);

    // Celebration particles for victory
    this.createCelebration();
  }

  createDefeatScreen(cx) {
    const title = this.add.text(cx, 30, 'DEFEAT', {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#e74c3c',
      stroke: '#4a0a0a',
      strokeThickness: 2,
    }).setOrigin(0.5);

    const level = LEVELS.find(l => l.id === this.levelId);
    this.add.text(cx, 52, level ? level.name : `Level ${this.levelId}`, {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#8a8aaa',
    }).setOrigin(0.5);

    // Motivational message
    const messages = [
      'The realm still needs you!',
      'Try a different tower strategy.',
      'Upgrade towers to fight harder enemies.',
      'Position is everything!',
    ];
    this.add.text(cx, 68, messages[Phaser.Math.Between(0, messages.length - 1)], {
      fontSize: '7px',
      fontFamily: 'monospace',
      color: '#f39c12',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Stats
    const panelY = 100;
    const panelBg = this.add.rectangle(cx, panelY, 160, 50, 0x2a1a1a, 0.6);
    panelBg.setStrokeStyle(1, 0x6a3a3a, 0.5);

    this.add.text(cx - 70, panelY - 18, 'SCORE', {
      fontSize: '6px', fontFamily: 'monospace', color: '#8a8aaa',
    });
    this.add.text(cx + 70, panelY - 18, `${this.score}`, {
      fontSize: '9px', fontFamily: 'monospace', color: '#ffd700',
    }).setOrigin(1, 0);

    this.add.text(cx - 70, panelY - 4, 'WAVES', {
      fontSize: '6px', fontFamily: 'monospace', color: '#8a8aaa',
    });
    this.add.text(cx + 70, panelY - 4, `${this.wavesCompleted}/${this.totalWaves}`, {
      fontSize: '9px', fontFamily: 'monospace', color: '#e74c3c',
    }).setOrigin(1, 0);

    // Name entry (if score > 0)
    if (this.score > 0) {
      this.createNameEntry(cx, 145);
    }

    // Action buttons
    this.createActionButtons(cx, this.score > 0 ? 195 : 155);
  }

  createStars(cx, y) {
    const starSpacing = 22;
    const startX = cx - starSpacing;

    for (let i = 0; i < 3; i++) {
      const x = startX + i * starSpacing;
      const filled = i < this.starCount;

      // Star shape using text
      const star = this.add.text(x, y, filled ? '\u2605' : '\u2606', {
        fontSize: '16px',
        fontFamily: 'serif',
        color: filled ? '#ffd700' : '#4a4a6a',
      }).setOrigin(0.5);

      if (filled) {
        // Animate stars appearing one by one
        star.setScale(0);
        this.tweens.add({
          targets: star,
          scale: 1,
          duration: 400,
          delay: 300 + i * 300,
          ease: 'Back.easeOut',
        });
      }
    }
  }

  createNameEntry(cx, y) {
    this.add.text(cx, y, 'Enter name:', {
      fontSize: '7px',
      fontFamily: 'monospace',
      color: '#8a8aaa',
    }).setOrigin(0.5);

    // Input field background
    const inputBg = this.add.rectangle(cx, y + 16, 100, 14, 0x0a0a1a, 0.8);
    inputBg.setStrokeStyle(1, 0x4a6a8a, 0.8);

    this.nameInput = '';
    this.nameDisplay = this.add.text(cx, y + 16, '_', {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#ecf0f1',
    }).setOrigin(0.5);

    // Blinking cursor
    this.cursorBlink = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        if (this.submitted) return;
        const cursor = this.cursorVisible ? '|' : '';
        this.cursorVisible = !this.cursorVisible;
        this.nameDisplay.setText(this.nameInput + cursor || '_');
      },
    });
    this.cursorVisible = true;
    this.submitted = false;

    // Keyboard input
    this.input.keyboard.on('keydown', (event) => {
      if (this.submitted) return;

      if (event.key === 'Backspace') {
        this.nameInput = this.nameInput.slice(0, -1);
      } else if (event.key === 'Enter' && this.nameInput.length > 0) {
        this.submitScore();
      } else if (event.key.length === 1 && this.nameInput.length < 10) {
        // Only allow alphanumeric and basic chars
        if (/[a-zA-Z0-9 _\-]/.test(event.key)) {
          this.nameInput += event.key;
        }
      }
      this.nameDisplay.setText(this.nameInput + '|');
    });

    // Submit button
    this.submitBtn = this.createButton(cx, y + 36, 'SUBMIT', () => {
      if (this.nameInput.length > 0) {
        this.submitScore();
      }
    }, 80, 0x27ae60, 0x2ecc71);
  }

  createActionButtons(cx, y) {
    const hasNextLevel = this.victory && LEVELS.find(l => l.id === this.levelId + 1);
    const btnCount = hasNextLevel ? 3 : 2;
    const totalWidth = btnCount * 72 + (btnCount - 1) * 8;
    let startX = cx - totalWidth / 2 + 36;

    // Separator line
    this.add.rectangle(cx, y - 12, 200, 1, 0x4a4a6a, 0.3);

    this.createButton(startX, y, 'RETRY', () => {
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => {
        this.scene.start('GameScene', { levelId: this.levelId });
      });
    }, 72, 0x4a4a6a, 0x6a6a8a);

    if (hasNextLevel) {
      startX += 80;
      this.createButton(startX, y, 'NEXT LEVEL', () => {
        this.cameras.main.fadeOut(400);
        this.time.delayedCall(400, () => {
          this.scene.start('GameScene', { levelId: this.levelId + 1 });
        });
      }, 72, 0x27ae60, 0x2ecc71);
    }

    startX += 80;
    this.createButton(startX, y, 'MENU', () => {
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => {
        this.scene.start('MenuScene');
      });
    }, 72, 0x4a4a6a, 0x6a6a8a);
  }

  createCelebration() {
    // Gold sparkles falling
    for (let i = 0; i < 20; i++) {
      const delay = Phaser.Math.Between(0, 2000);
      this.time.delayedCall(delay, () => {
        const x = Phaser.Math.Between(10, GAME_WIDTH - 10);
        const p = this.add.circle(x, -5, Phaser.Math.Between(1, 2),
          Phaser.Math.RND.pick([0xffd700, 0xf39c12, 0xffeaa7]),
          Phaser.Math.FloatBetween(0.4, 1)
        );
        this.tweens.add({
          targets: p,
          y: GAME_HEIGHT + 10,
          x: x + Phaser.Math.Between(-30, 30),
          alpha: 0,
          duration: Phaser.Math.Between(2000, 4000),
          onComplete: () => p.destroy(),
        });
      });
    }
  }

  createBackgroundParticles() {
    // Subtle floating particles
    for (let i = 0; i < 15; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        1,
        this.victory ? 0xffd700 : 0x4a4a6a,
        Phaser.Math.FloatBetween(0.1, 0.3)
      );
      p.setDepth(-1);
      this.tweens.add({
        targets: p,
        y: p.y + Phaser.Math.Between(-20, 20),
        x: p.x + Phaser.Math.Between(-10, 10),
        alpha: 0,
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  submitScore() {
    if (this.submitted || this.nameInput.length === 0) return;
    this.submitted = true;

    const lb = new LeaderboardManager();
    const rank = lb.submitScore(
      this.nameInput,
      this.score,
      this.levelId,
      this.wavesCompleted
    );

    if (this.cursorBlink) this.cursorBlink.remove();
    this.nameDisplay.setText(this.nameInput);

    if (this.submitBtn) {
      const rankText = rank ? `RANK #${rank}!` : 'SAVED!';
      this.submitBtn.label.setText(rankText);
      this.submitBtn.label.setColor('#ffd700');
      this.submitBtn.bg.setFillStyle(0x27ae60, 0.4);
      this.submitBtn.bg.setStrokeStyle(1, 0x2ecc71, 0.8);
    }
  }

  createButton(x, y, text, callback, width = 95, bgColor = 0x4a4a6a, borderColor = 0x6a6a8a) {
    const bg = this.add.rectangle(x, y, width, 16, bgColor, 0.4);
    bg.setStrokeStyle(1, borderColor, 0.7);
    bg.setInteractive({ useHandCursor: true });

    const label = this.add.text(x, y, text, {
      fontSize: '7px',
      fontFamily: 'monospace',
      color: '#ecf0f1',
    }).setOrigin(0.5);

    bg.on('pointerover', () => {
      bg.setFillStyle(bgColor, 0.7);
      bg.setStrokeStyle(1, 0xffd700, 0.9);
      label.setColor('#ffd700');
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(bgColor, 0.4);
      bg.setStrokeStyle(1, borderColor, 0.7);
      label.setColor('#ecf0f1');
    });
    bg.on('pointerdown', callback);

    return { bg, label };
  }
}
