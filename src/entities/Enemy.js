import Phaser from 'phaser';
import { COLORS, TILE_SIZE } from '../utils/constants.js';
import { ENEMY_DATA, getScaledEnemyStats } from '../data/enemies.js';

export default class Enemy {
  constructor(scene, type, waypoints, waveNumber) {
    this.scene = scene;
    this.type = type;
    this.waypoints = waypoints;
    this.currentWaypoint = 0;
    this.alive = true;
    this.reachedEnd = false;

    // Get scaled stats
    const stats = getScaledEnemyStats(type, waveNumber);
    this.maxHp = stats.hp;
    this.hp = stats.hp;
    this.speed = stats.speed;
    this.gold = stats.gold;
    this.damage = stats.damage;
    this.isFlying = stats.isFlying;
    this.isStealth = stats.isStealth;
    this.isBoss = stats.isBoss || false;
    this.abilities = stats.abilities || [];
    this.size = stats.size || 1;
    this.name = stats.name;

    // Ability properties
    this.regenRate = stats.regenRate || 0;
    this.healAmount = stats.healAmount || 0;
    this.healRadius = stats.healRadius || 0;
    this.healRate = stats.healRate || 0;
    this.lastHealTime = 0;

    // Status effects
    this.statusEffects = {};
    this.revealed = false;

    // Position at start (with slight random offset to prevent stacking)
    const start = waypoints[0];
    this.x = start.x + Phaser.Math.FloatBetween(-3, 3);
    this.y = start.y + Phaser.Math.FloatBetween(-3, 3);

    // Create sprite
    this.sprite = scene.add.image(this.x, this.y, stats.sprite);
    if (this.size !== 1) {
      this.sprite.setScale(this.size);
    }
    this.sprite.setDepth(10);

    // Flying enemies bob up and down and have a shadow
    if (this.isFlying) {
      this.flyOffset = 0;
      this.shadow = scene.add.ellipse(this.x, this.y + 8, 10, 4, 0x000000, 0.3);
      this.shadow.setDepth(9);
    }

    // Stealth visual
    if (this.isStealth) {
      this.sprite.setAlpha(0.3);
    }

    // Health bar (compact)
    this.hpBarWidth = this.isBoss ? 16 : 10;
    this.healthBarBg = scene.add.rectangle(this.x, this.y - 10 * this.size, this.hpBarWidth, 1.5, COLORS.HEALTH_BG);
    this.healthBarBg.setDepth(15);
    this.healthBar = scene.add.rectangle(this.x, this.y - 10 * this.size, this.hpBarWidth, 1.5, COLORS.HEALTH_GREEN);
    this.healthBar.setDepth(16);

    // Boss indicator
    if (this.isBoss) {
      this.bossGlow = scene.add.circle(this.x, this.y, 12 * this.size, 0xff0000, 0.15);
      this.bossGlow.setDepth(9);
    }

    // Progress along path (0 to 1)
    this.pathProgress = 0;
  }

  update(delta) {
    if (!this.alive) return;

    const dt = delta / 1000;

    // Apply status effects
    this.updateStatusEffects(dt);

    // Movement
    let currentSpeed = this.speed;

    // Apply slow
    if (this.statusEffects.slow) {
      currentSpeed *= (1 - this.statusEffects.slow.amount);
    }

    // Freeze stops movement entirely
    if (this.statusEffects.freeze) {
      currentSpeed = 0;
    }

    // Move towards next waypoint
    if (this.currentWaypoint < this.waypoints.length - 1) {
      const target = this.waypoints[this.currentWaypoint + 1];
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 2) {
        this.currentWaypoint++;
        if (this.currentWaypoint >= this.waypoints.length - 1) {
          this.reachEnd();
          return;
        }
      } else {
        const moveX = (dx / dist) * currentSpeed * dt;
        const moveY = (dy / dist) * currentSpeed * dt;
        this.x += moveX;
        this.y += moveY;

        // Face direction of movement
        if (dx < -1) this.sprite.setFlipX(true);
        else if (dx > 1) this.sprite.setFlipX(false);
      }
    }

    // Regeneration ability
    if (this.abilities.includes('regenerate') && this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + this.regenRate * dt);
    }

    // Healing ability
    if (this.abilities.includes('heal')) {
      const now = this.scene.time.now;
      if (now - this.lastHealTime >= this.healRate) {
        this.healNearbyEnemies();
        this.lastHealTime = now;
      }
    }

    // Burn damage
    if (this.statusEffects.burn) {
      this.takeDamage(this.statusEffects.burn.dps * dt, 'burn');
    }

    // Update visuals (guard against death from burn)
    if (!this.alive) return;
    this.updateVisuals();
  }

  updateStatusEffects(dt) {
    for (const [effect, data] of Object.entries(this.statusEffects)) {
      data.remaining -= dt * 1000;
      if (data.remaining <= 0) {
        delete this.statusEffects[effect];
        if (this.sprite && (effect === 'slow' || effect === 'freeze')) {
          this.sprite.clearTint();
        }
      }
    }
  }

  updateVisuals() {
    this.sprite.setPosition(this.x, this.y + (this.isFlying ? Math.sin(this.scene.time.now / 300) * 3 - 5 : 0));

    if (this.isFlying && this.shadow) {
      this.shadow.setPosition(this.x, this.y + 8);
    }

    // Health bar
    const hpRatio = this.hp / this.maxHp;
    const barY = this.y - 10 * this.size;
    const halfBar = this.hpBarWidth / 2;
    this.healthBarBg.setPosition(this.x, barY);
    this.healthBar.setPosition(this.x - halfBar * (1 - hpRatio), barY);
    this.healthBar.setSize(this.hpBarWidth * hpRatio, 1.5);
    this.healthBar.setFillStyle(hpRatio > 0.5 ? COLORS.HEALTH_GREEN : hpRatio > 0.25 ? COLORS.GOLD : COLORS.HEALTH_RED);

    // Status effect visuals
    if (this.statusEffects.slow) {
      this.sprite.setTint(0x74b9ff);
    } else if (this.statusEffects.freeze) {
      this.sprite.setTint(0xffffff);
    } else if (this.statusEffects.burn) {
      this.sprite.setTint(0xff6b35);
    }

    // Stealth
    if (this.isStealth && !this.revealed) {
      this.sprite.setAlpha(0.3);
    } else {
      if (!this.statusEffects.freeze) {
        this.sprite.setAlpha(1);
      }
    }

    // Boss glow
    if (this.bossGlow) {
      this.bossGlow.setPosition(this.x, this.y);
      const pulse = 0.1 + Math.sin(this.scene.time.now / 500) * 0.05;
      this.bossGlow.setAlpha(pulse);
    }
  }

  applyStatusEffect(effect, data) {
    this.statusEffects[effect] = { ...data };
  }

  reveal() {
    this.revealed = true;
    this.sprite.setAlpha(1);
  }

  takeDamage(amount, source) {
    if (!this.alive) return;

    this.hp -= amount;

    // Floating damage number
    if (source !== 'burn') {
      this.showDamageNumber(Math.floor(amount));
    }

    if (this.hp <= 0) {
      this.die();
    }
  }

  showDamageNumber(amount) {
    const text = this.scene.add.text(
      this.x + Phaser.Math.Between(-5, 5),
      this.y - 12,
      `-${amount}`,
      {
        fontSize: '7px',
        fontFamily: 'monospace',
        color: '#ff6b6b',
        stroke: '#000000',
        strokeThickness: 1,
      }
    );
    text.setDepth(50);
    text.setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 15,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  healNearbyEnemies() {
    if (!this.scene.enemies) return;
    for (const enemy of this.scene.enemies) {
      if (enemy === this || !enemy.alive) continue;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
      if (dist <= this.healRadius && enemy.hp < enemy.maxHp) {
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + this.healAmount);

        // Heal visual
        const healText = this.scene.add.text(enemy.x, enemy.y - 12, `+${this.healAmount}`, {
          fontSize: '7px',
          fontFamily: 'monospace',
          color: '#55efc4',
          stroke: '#000000',
          strokeThickness: 1,
        });
        healText.setDepth(50);
        healText.setOrigin(0.5);
        this.scene.tweens.add({
          targets: healText,
          y: healText.y - 12,
          alpha: 0,
          duration: 600,
          onComplete: () => healText.destroy(),
        });
      }
    }
  }

  die() {
    if (!this.alive) return; // Prevent double-death
    this.alive = false;

    // Death particles
    if (this.scene.add) {
      for (let i = 0; i < 6; i++) {
        const p = this.scene.add.circle(
          this.x + Phaser.Math.Between(-6, 6),
          this.y + Phaser.Math.Between(-6, 6),
          Phaser.Math.Between(1, 3),
          this.isBoss ? 0xff0000 : 0xffffff,
          0.8
        );
        p.setDepth(20);
        this.scene.tweens.add({
          targets: p,
          x: p.x + Phaser.Math.Between(-15, 15),
          y: p.y + Phaser.Math.Between(-20, -5),
          alpha: 0,
          scale: 0,
          duration: Phaser.Math.Between(300, 600),
          onComplete: () => p.destroy(),
        });
      }
    }

    // Emit event for gold/score
    this.scene.events.emit('enemyKilled', this);

    this.destroy();
  }

  reachEnd() {
    this.alive = false;
    this.reachedEnd = true;
    this.scene.events.emit('enemyReachedEnd', this);
    this.destroy();
  }

  destroy() {
    if (this.sprite) { this.sprite.destroy(); this.sprite = null; }
    if (this.healthBar) { this.healthBar.destroy(); this.healthBar = null; }
    if (this.healthBarBg) { this.healthBarBg.destroy(); this.healthBarBg = null; }
    if (this.shadow) { this.shadow.destroy(); this.shadow = null; }
    if (this.bossGlow) { this.bossGlow.destroy(); this.bossGlow = null; }
  }

  // How far along the path is this enemy (for "first" targeting)
  getPathProgress() {
    let totalDist = 0;
    for (let i = 0; i < this.currentWaypoint; i++) {
      totalDist += Phaser.Math.Distance.Between(
        this.waypoints[i].x, this.waypoints[i].y,
        this.waypoints[i + 1].x, this.waypoints[i + 1].y
      );
    }
    if (this.currentWaypoint < this.waypoints.length - 1) {
      totalDist += Phaser.Math.Distance.Between(
        this.waypoints[this.currentWaypoint].x,
        this.waypoints[this.currentWaypoint].y,
        this.x, this.y
      );
    }
    return totalDist;
  }

  isTargetable(tower) {
    if (!this.alive) return false;
    if (this.isFlying && !tower.canTargetFlying) return false;
    if (this.isStealth && !this.revealed && !tower.canReveal) return false;
    return true;
  }
}
