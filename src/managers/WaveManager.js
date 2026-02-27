import Enemy from '../entities/Enemy.js';

export default class WaveManager {
  constructor(scene, waves, waypoints, customDefs = {}) {
    this.scene = scene;
    this.waves = waves;
    this.waypoints = waypoints;
    this.customDefs = customDefs;
    this.currentWave = 0;
    this.waveActive = false;
    this.spawning = false;
    this.spawnQueues = [];
    this.betweenWaves = true;
    this.waveStartTime = 0;
    this.allWavesComplete = false;
  }

  getTotalWaves() {
    return this.waves.length;
  }

  getCurrentWaveNumber() {
    return this.currentWave + 1;
  }

  getNextWave() {
    return this.waves[this.currentWave] || null;
  }

  startNextWave() {
    if (this.currentWave >= this.waves.length) {
      this.allWavesComplete = true;
      this.scene.events.emit('allWavesComplete');
      return;
    }

    const wave = this.waves[this.currentWave];
    this.waveActive = true;
    this.spawning = true;
    this.betweenWaves = false;
    this.spawnQueues = [];
    this.waveStartTime = this.scene.time.now;

    // Build spawn queues for each enemy group in the wave
    for (const group of wave.enemies) {
      const queue = {
        type: group.type,
        remaining: group.count,
        interval: group.interval,
        delay: group.delay || 0,
        lastSpawnTime: 0,
        started: false,
      };
      this.spawnQueues.push(queue);
    }

    // Wave announcement
    this.scene.events.emit('waveStarted', this.currentWave + 1);
  }

  update(delta) {
    if (!this.waveActive || !this.spawning) return;

    const now = this.scene.time.now;
    const elapsed = now - this.waveStartTime;
    let allDone = true;

    for (const queue of this.spawnQueues) {
      if (queue.remaining <= 0) continue;
      allDone = false;

      // Wait for delay
      if (elapsed < queue.delay) continue;

      // Start spawning
      if (!queue.started) {
        queue.started = true;
        queue.lastSpawnTime = now;
      }

      // Spawn at interval
      if (now - queue.lastSpawnTime >= queue.interval) {
        this.spawnEnemy(queue.type);
        queue.remaining--;
        queue.lastSpawnTime = now;
      }
    }

    if (allDone) {
      this.spawning = false;
    }
  }

  spawnEnemy(type) {
    const enemy = new Enemy(
      this.scene,
      type,
      this.waypoints,
      this.currentWave + 1,
      this.customDefs
    );
    this.scene.enemies.push(enemy);
  }

  checkWaveComplete() {
    if (!this.waveActive) return false;

    // Wave complete when all enemies spawned and all dead/reached end
    if (this.spawning) return false;

    const allEnemiesDone = this.scene.enemies.every(e => !e.alive);
    if (allEnemiesDone) {
      this.waveActive = false;
      this.betweenWaves = true;
      this.currentWave++;

      if (this.currentWave >= this.waves.length) {
        this.allWavesComplete = true;
        this.scene.events.emit('allWavesComplete');
      } else {
        this.scene.events.emit('waveComplete', this.currentWave);
      }
      return true;
    }
    return false;
  }
}
