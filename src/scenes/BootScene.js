import Phaser from 'phaser';
import { generateTextures } from '../utils/PixelArtGenerator.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    // Generate all cartoon-style textures
    generateTextures(this);

    // Quick transition to menu
    this.cameras.main.fadeIn(500);
    this.time.delayedCall(600, () => {
      this.scene.start('MenuScene');
    });
  }
}
