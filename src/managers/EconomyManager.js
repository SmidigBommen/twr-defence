import { BALANCE } from '../utils/constants.js';

export default class EconomyManager {
  constructor(scene, startingGold, startingLives) {
    this.scene = scene;
    this.gold = startingGold;
    this.lives = startingLives;
    this.maxLives = startingLives;
    this.score = 0;
    this.kills = 0;
    this.wavesCompleted = 0;
  }

  canAfford(cost) {
    return this.gold >= cost;
  }

  spend(amount) {
    if (!this.canAfford(amount)) return false;
    this.gold -= amount;
    this.scene.events.emit('goldChanged', this.gold);
    return true;
  }

  earn(amount) {
    this.gold += amount;
    this.scene.events.emit('goldChanged', this.gold);
  }

  loseLife(amount = 1) {
    this.lives -= amount;
    this.scene.events.emit('livesChanged', this.lives);
    if (this.lives <= 0) {
      this.lives = 0;
      this.scene.events.emit('gameOver', false);
    }
  }

  addKill(enemy) {
    this.kills++;
    this.earn(enemy.gold);
    this.score += BALANCE.SCORE_PER_KILL;

    // Show gold earned
    this.showGoldEarned(enemy.x, enemy.y, enemy.gold);
  }

  completeWave() {
    this.wavesCompleted++;
    const bonus = BALANCE.GOLD_PER_WAVE_BONUS;
    this.earn(bonus);
    this.score += BALANCE.SCORE_PER_WAVE;
  }

  completeLevel() {
    this.score += BALANCE.SCORE_LEVEL_COMPLETE;
    this.score += this.lives * BALANCE.SCORE_PER_LIFE;
  }

  showGoldEarned(x, y, amount) {
    const text = this.scene.add.text(x, y - 8, `+${amount}`, {
      fontSize: '7px',
      fontFamily: 'monospace',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 1,
    });
    text.setDepth(50);
    text.setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 18,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }
}
