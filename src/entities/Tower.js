import Phaser from 'phaser';
import { COLORS, TARGET_MODE, TILE_SIZE, SPRITE_SIZES } from '../utils/constants.js';
import { TOWER_DATA } from '../data/towers.js';
import Projectile from './Projectile.js';

export default class Tower {
  constructor(scene, type, gridX, gridY) {
    this.scene = scene;
    this.type = type;
    this.gridX = gridX;
    this.gridY = gridY;
    this.level = 0; // 0-indexed upgrade level
    this.data = TOWER_DATA[type];
    this.timeSinceLastFire = 0;
    this.target = null;
    this.selected = false;

    // Position (center of tile)
    this.x = gridX * TILE_SIZE + TILE_SIZE / 2;
    this.y = gridY * TILE_SIZE + TILE_SIZE / 2;

    // Properties from data
    this.canTargetFlying = this.data.canTargetFlying;
    this.isBarracks = this.data.isBarracks || false;
    this.isSupport = this.data.isSupport || false;
    this.canReveal = false;

    // Tower type color for the base indicator
    const typeColors = {
      arcane: 0x7b2fbe, flame: 0xc0392b, frost: 0x85c1e9,
      barracks: 0x7f8c8d, lightning: 0xf1c40f, enchanter: 0x27ae60,
    };
    this.baseColor = typeColors[type] || 0xffffff;

    // Colored base circle (always visible, shows tower type)
    const baseRadius = Math.round(SPRITE_SIZES.TOWER / 3); // ~10px
    this.baseCircle = scene.add.circle(this.x, this.y + 2, baseRadius, this.baseColor, 0.25);
    this.baseCircle.setDepth(4);

    // Create sprite
    this.sprite = scene.add.image(this.x, this.y, this.data.icon);
    this.sprite.setDepth(5);
    this.sprite.setInteractive();
    this.sprite.on('pointerdown', () => this.onSelect());

    // Range circle (hidden by default)
    this.rangeCircle = scene.add.circle(this.x, this.y, this.getRange(), 0xffffff, 0.08);
    this.rangeCircle.setStrokeStyle(1, 0xffffff, 0.2);
    this.rangeCircle.setDepth(4);
    this.rangeCircle.setVisible(false);

    // Placement animation
    this.sprite.setScale(0);
    scene.tweens.add({
      targets: this.sprite,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });

    // Buff tracking
    this.damageMultiplier = 1;
    this.rangeMultiplier = 1;

    // For barracks - soldiers
    this.soldiers = [];

    // For support - buff pulse visual
    if (this.isSupport) {
      this.buffPulseTimer = 0;
    }
  }

  getStats() {
    return this.data.levels[this.level];
  }

  getRange() {
    const stats = this.getStats();
    const range = stats.range || 0;
    return range * this.rangeMultiplier;
  }

  getDamage() {
    const stats = this.getStats();
    return (stats.damage || 0) * this.damageMultiplier;
  }

  getFireRate() {
    return this.getStats().fireRate || 1000;
  }

  getTotalCost() {
    let cost = this.data.cost;
    for (let i = 1; i <= this.level; i++) {
      cost += this.data.levels[i].upgradeCost || 0;
    }
    return cost;
  }

  getUpgradeCost() {
    if (this.level >= this.data.levels.length - 1) return null;
    return this.data.levels[this.level + 1].upgradeCost;
  }

  getSellValue() {
    return Math.floor(this.getTotalCost() * 0.6);
  }

  canUpgrade() {
    return this.level < this.data.levels.length - 1;
  }

  upgrade() {
    if (!this.canUpgrade()) return false;
    this.level++;

    // Check for special abilities
    const stats = this.getStats();
    if (stats.special === 'reveal' || stats.special === 'empower') {
      this.canReveal = true;
    }

    // Update range circle
    this.rangeCircle.setRadius(this.getRange());

    // Upgrade visual
    this.sprite.setScale(1.3);
    this.scene.tweens.add({
      targets: this.sprite,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });

    // Sparkle effect
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const p = this.scene.add.circle(
        this.x + Math.cos(angle) * 10,
        this.y + Math.sin(angle) * 10,
        2,
        COLORS.GOLD,
        1
      );
      p.setDepth(20);
      this.scene.tweens.add({
        targets: p,
        x: this.x + Math.cos(angle) * 20,
        y: this.y + Math.sin(angle) * 20,
        alpha: 0,
        duration: 500,
        onComplete: () => p.destroy(),
      });
    }

    return true;
  }

  update(delta) {
    if (this.isSupport) {
      this.updateSupport(delta);
      return;
    }

    if (this.isBarracks) {
      this.updateBarracks(delta);
      return;
    }

    // Find target
    this.target = this.findTarget();

    // Fire at target using accumulated delta (respects game speed)
    this.timeSinceLastFire += delta;
    if (this.target && this.timeSinceLastFire >= this.getFireRate()) {
      this.fire();
      this.timeSinceLastFire = 0;
    }
  }

  findTarget() {
    const enemies = this.scene.enemies;
    if (!enemies || enemies.length === 0) return null;

    const range = this.getRange();
    const inRange = enemies.filter(e => {
      if (!e.isTargetable(this)) return false;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
      return dist <= range;
    });

    if (inRange.length === 0) return null;

    const mode = this.data.targetMode || TARGET_MODE.FIRST;

    switch (mode) {
      case TARGET_MODE.FIRST:
        return inRange.reduce((best, e) =>
          e.getPathProgress() > best.getPathProgress() ? e : best
        );
      case TARGET_MODE.LAST:
        return inRange.reduce((best, e) =>
          e.getPathProgress() < best.getPathProgress() ? e : best
        );
      case TARGET_MODE.NEAREST:
        return inRange.reduce((best, e) => {
          const dE = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
          const dB = Phaser.Math.Distance.Between(this.x, this.y, best.x, best.y);
          return dE < dB ? e : best;
        });
      case TARGET_MODE.STRONGEST:
        return inRange.reduce((best, e) =>
          e.hp > best.hp ? e : best
        );
      default:
        return inRange[0];
    }
  }

  fire() {
    if (!this.target) return;

    // Lightning tower: chain lightning visual (no projectile)
    if (this.type === 'lightning') {
      this.fireLightning();
      return;
    }

    // Create projectile with computed damage (includes enchanter buff)
    const proj = new Projectile(
      this.scene,
      this.x,
      this.y - SPRITE_SIZES.TOWER / 4, // Shoot from top of tower
      this.target,
      this.data,
      this.level,
      this.getDamage()
    );
    this.scene.projectiles.push(proj);

    // Firing animation - recoil
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.y + 2,
      duration: 50,
      yoyo: true,
    });
  }

  fireLightning() {
    const stats = this.getStats();
    let currentTarget = this.target;
    let currentDamage = this.getDamage();
    const chainCount = stats.chainCount || 2;
    const falloff = stats.chainDamageFalloff || 0.7;
    const hitTargets = [currentTarget];

    // Hit first target
    currentTarget.takeDamage(currentDamage);

    // Draw lightning bolt
    this.drawLightning(this.x, this.y - SPRITE_SIZES.TOWER / 4, currentTarget.x, currentTarget.y);

    // Chain to nearby enemies
    for (let i = 1; i < chainCount; i++) {
      currentDamage *= falloff;
      const nextTarget = this.findChainTarget(currentTarget, hitTargets);
      if (!nextTarget) break;

      this.drawLightning(currentTarget.x, currentTarget.y, nextTarget.x, nextTarget.y);
      nextTarget.takeDamage(currentDamage);

      if (stats.special === 'stun' && Math.random() < 0.15) {
        nextTarget.applyStatusEffect('freeze', { remaining: 600 });
      }

      hitTargets.push(nextTarget);
      currentTarget = nextTarget;
    }
  }

  findChainTarget(from, exclude) {
    const enemies = this.scene.enemies;
    if (!enemies) return null;

    let best = null;
    let bestDist = 50; // Chain range

    for (const e of enemies) {
      if (!e.alive || exclude.includes(e)) continue;
      const dist = Phaser.Math.Distance.Between(from.x, from.y, e.x, e.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = e;
      }
    }

    return best;
  }

  drawLightning(x1, y1, x2, y2) {
    const graphics = this.scene.add.graphics();
    graphics.setDepth(15);
    graphics.lineStyle(2, COLORS.LIGHTNING_YELLOW, 0.9);
    graphics.beginPath();
    graphics.moveTo(x1, y1);

    // Jagged lightning segments
    const segments = 4;
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const mx = x1 + (x2 - x1) * t + Phaser.Math.Between(-6, 6);
      const my = y1 + (y2 - y1) * t + Phaser.Math.Between(-6, 6);
      graphics.lineTo(mx, my);
    }
    graphics.lineTo(x2, y2);
    graphics.strokePath();

    // Fade out
    this.scene.tweens.add({
      targets: graphics,
      alpha: 0,
      duration: 200,
      onComplete: () => graphics.destroy(),
    });
  }

  updateSupport(delta) {
    // Buff nearby towers periodically
    this.buffPulseTimer = (this.buffPulseTimer || 0) + delta;
    if (this.buffPulseTimer >= 2000) {
      this.buffPulseTimer = 0;
      this.applyBuffs();

      // Visual pulse (use scale instead of radius for proper tween)
      const startRadius = 5;
      const endScale = this.getRange() / startRadius;
      const pulse = this.scene.add.circle(this.x, this.y, startRadius, COLORS.ENCHANTER_SECONDARY, 0.3);
      pulse.setDepth(4);
      this.scene.tweens.add({
        targets: pulse,
        scaleX: endScale,
        scaleY: endScale,
        alpha: 0,
        duration: 800,
        onComplete: () => pulse.destroy(),
      });
    }
  }

  applyBuffs() {
    const stats = this.getStats();
    const range = this.getRange();
    const towers = this.scene.towers;
    if (!towers) return;

    for (const tower of towers) {
      if (tower === this || tower.isSupport) continue;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, tower.x, tower.y);
      if (dist <= range) {
        tower.damageMultiplier = 1 + stats.damageBoost;
        tower.rangeMultiplier = 1 + stats.rangeBoost;

        // Reveal ability for stealth
        if (stats.special === 'reveal' || stats.special === 'empower') {
          tower.canReveal = true;
        }
      }
    }

    // Reveal nearby stealth enemies
    if (stats.special === 'reveal' || stats.special === 'empower') {
      const enemies = this.scene.enemies;
      if (enemies) {
        for (const enemy of enemies) {
          if (enemy.isStealth && enemy.alive) {
            const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            if (dist <= range) {
              enemy.reveal();
            }
          }
        }
      }
    }
  }

  updateBarracks(delta) {
    // Barracks doesn't shoot - it spawns soldiers handled at GameScene level
    // For now, simple implementation: damage enemies that pass nearby
    const stats = this.getStats();
    const range = this.getRange ? this.getRange() : stats.range;
    const enemies = this.scene.enemies;
    if (!enemies) return;

    this.timeSinceLastFire += delta;
    if (this.timeSinceLastFire < 1000) return;
    this.timeSinceLastFire = 0;

    for (const enemy of enemies) {
      if (!enemy.alive || enemy.isFlying) continue;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
      if (dist <= range) {
        // Slow and damage (simulating soldiers blocking)
        enemy.takeDamage(stats.soldierDamage || 5);
        enemy.applyStatusEffect('slow', { amount: 0.5, remaining: 500 });

        // Visual: sword slash
        const slash = this.scene.add.text(enemy.x, enemy.y - 6, '/', {
          fontSize: '8px',
          color: '#bdc3c7',
          stroke: '#000',
          strokeThickness: 1,
        });
        slash.setDepth(20);
        slash.setOrigin(0.5);
        this.scene.tweens.add({
          targets: slash,
          alpha: 0,
          rotation: 0.5,
          duration: 300,
          onComplete: () => slash.destroy(),
        });
        break; // One enemy at a time
      }
    }
  }

  onSelect() {
    this.scene.events.emit('towerSelected', this);
  }

  showRange() {
    this.rangeCircle.setRadius(this.getRange());
    this.rangeCircle.setVisible(true);
    this.selected = true;
  }

  hideRange() {
    this.rangeCircle.setVisible(false);
    this.selected = false;
  }

  sell() {
    // Sell animation
    this.scene.tweens.add({
      targets: [this.sprite, this.rangeCircle, this.baseCircle],
      scale: 0,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        if (this.sprite) this.sprite.destroy();
        if (this.rangeCircle) this.rangeCircle.destroy();
        if (this.baseCircle) this.baseCircle.destroy();
      },
    });

    // Gold particles
    for (let i = 0; i < 5; i++) {
      const p = this.scene.add.circle(
        this.x + Phaser.Math.Between(-5, 5),
        this.y + Phaser.Math.Between(-5, 5),
        2,
        COLORS.GOLD,
        1
      );
      p.setDepth(20);
      this.scene.tweens.add({
        targets: p,
        y: p.y - 20,
        alpha: 0,
        duration: 500,
        delay: i * 50,
        onComplete: () => p.destroy(),
      });
    }

    return this.getSellValue();
  }

  destroy() {
    if (this.sprite) this.sprite.destroy();
    if (this.rangeCircle) this.rangeCircle.destroy();
    if (this.baseCircle) this.baseCircle.destroy();
  }
}
