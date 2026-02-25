import Phaser from 'phaser';

export default class Projectile {
  constructor(scene, x, y, target, towerData, towerLevel, computedDamage) {
    this.scene = scene;
    this.target = target;
    this.towerData = towerData;
    this.towerLevel = towerLevel;
    this.computedDamage = computedDamage;
    this.alive = true;
    this.x = x;
    this.y = y;
    this.speed = towerData.projectileSpeed || 200;

    // Create sprite
    const textureKey = towerData.projectile || 'proj_arcane';
    this.sprite = scene.add.image(x, y, textureKey);
    this.sprite.setDepth(12);
    this.sprite.setScale(0.8);

    // Trail particles
    this.trailTimer = 0;
  }

  update(delta) {
    if (!this.alive) return;

    const dt = delta / 1000;

    // If target is dead, destroy self
    if (!this.target || !this.target.alive) {
      this.destroy();
      return;
    }

    // Move towards target
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      this.hit();
      return;
    }

    const moveX = (dx / dist) * this.speed * dt;
    const moveY = (dy / dist) * this.speed * dt;
    this.x += moveX;
    this.y += moveY;
    this.sprite.setPosition(this.x, this.y);

    // Rotation towards target
    this.sprite.setRotation(Math.atan2(dy, dx));

    // Trail effect
    this.trailTimer += delta;
    if (this.trailTimer > 50) {
      this.trailTimer = 0;
      this.createTrail();
    }
  }

  createTrail() {
    const trail = this.scene.add.circle(this.x, this.y, 1, this.getTrailColor(), 0.5);
    trail.setDepth(11);
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 0,
      duration: 200,
      onComplete: () => trail.destroy(),
    });
  }

  getTrailColor() {
    const type = this.towerData.projectile;
    if (type === 'proj_flame') return 0xff6b35;
    if (type === 'proj_frost') return 0x74b9ff;
    if (type === 'proj_lightning') return 0xffeaa7;
    return 0xbb6bd9;
  }

  hit() {
    if (!this.alive) return;
    this.alive = false;

    const stats = this.towerData.levels[this.towerLevel];
    const damage = this.computedDamage || stats.damage;

    // Apply damage to target
    if (this.target && this.target.alive) {
      this.target.takeDamage(damage);

      // Splash damage (flame tower)
      if (stats.splashRadius) {
        this.applySplash(stats);
      }

      // Slow effect (frost tower)
      if (stats.slowAmount) {
        this.target.applyStatusEffect('slow', {
          amount: stats.slowAmount,
          remaining: stats.slowDuration,
        });
      }

      // Burn effect (flame tower)
      if (stats.burnDamage) {
        this.target.applyStatusEffect('burn', {
          dps: stats.burnDamage,
          remaining: stats.burnDuration,
        });
      }

      // Freeze effect (frost tier 3)
      if (stats.special === 'freeze' && Math.random() < 0.15) {
        this.target.applyStatusEffect('freeze', {
          remaining: 1500,
        });
      }

      // Stun effect (lightning tier 3)
      if (stats.special === 'stun' && Math.random() < 0.2) {
        this.target.applyStatusEffect('freeze', {
          remaining: 800,
        });
      }
    }

    // Impact visual
    this.createImpact();
    this.destroy();
  }

  applySplash(stats) {
    if (!this.scene.enemies) return;
    for (const enemy of this.scene.enemies) {
      if (enemy === this.target || !enemy.alive) continue;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
      if (dist <= stats.splashRadius) {
        const falloff = 1 - (dist / stats.splashRadius) * 0.5;
        enemy.takeDamage(stats.damage * falloff);
        if (stats.burnDamage) {
          enemy.applyStatusEffect('burn', {
            dps: stats.burnDamage * 0.5,
            remaining: stats.burnDuration * 0.5,
          });
        }
      }
    }
  }

  createImpact() {
    const color = this.getTrailColor();
    for (let i = 0; i < 4; i++) {
      const p = this.scene.add.circle(
        this.x + Phaser.Math.Between(-4, 4),
        this.y + Phaser.Math.Between(-4, 4),
        Phaser.Math.Between(1, 2),
        color,
        0.8
      );
      p.setDepth(20);
      this.scene.tweens.add({
        targets: p,
        x: p.x + Phaser.Math.Between(-8, 8),
        y: p.y + Phaser.Math.Between(-8, 8),
        alpha: 0,
        scale: 0,
        duration: 300,
        onComplete: () => p.destroy(),
      });
    }
  }

  destroy() {
    this.alive = false;
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
}
