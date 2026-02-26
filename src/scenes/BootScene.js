import Phaser from 'phaser';
import { ASSET_MANIFEST } from '../data/assetManifest.js';
import { generateFallbackTextures } from '../utils/PixelArtGenerator.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
    this.failedKeys = new Set();
  }

  preload() {
    // Try loading PNGs for all manifest entries; missing files are expected
    this.load.on('loaderror', (file) => {
      this.failedKeys.add(file.key);
    });

    for (const entry of ASSET_MANIFEST) {
      this.load.image(entry.key, entry.path);
    }
  }

  create() {
    // Procedurally generate any textures that weren't loaded from PNGs
    generateFallbackTextures(this);

    this.cameras.main.fadeIn(500);
    this.time.delayedCall(600, () => {
      this.scene.start('MenuScene');
    });
  }
}
