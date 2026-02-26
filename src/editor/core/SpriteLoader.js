import { ASSET_MANIFEST } from '../../data/assetManifest.js';
import { eventBus } from './EventBus.js';

const LS_KEY = 'td_editor_sprites';

export default class SpriteLoader {
  constructor() {
    this._images = new Map();    // key → HTMLImageElement (from filesystem)
    this._overrides = new Map(); // key → HTMLImageElement (user imports)
    this._loadOverrides();
    this._loadAssets();
  }

  _loadAssets() {
    for (const entry of ASSET_MANIFEST) {
      const img = new Image();
      img.onload = () => {
        this._images.set(entry.key, img);
        eventBus.emit('sprites:changed');
      };
      // Vite serves public/ at root
      img.src = `/${entry.path}`;
    }
  }

  _loadOverrides() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      for (const [key, dataUrl] of Object.entries(data)) {
        const img = new Image();
        img.onload = () => {
          this._overrides.set(key, img);
          eventBus.emit('sprites:changed');
        };
        img.src = dataUrl;
      }
    } catch { /* ignore corrupt data */ }
  }

  _saveOverrides() {
    const data = {};
    for (const [key, img] of this._overrides) {
      data[key] = img.src;
    }
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }

  /** Returns HTMLImageElement or null. Imported overrides take priority. */
  get(key) {
    return this._overrides.get(key) || this._images.get(key) || null;
  }

  /** Import a File as a sprite override for the given texture key. */
  import(key, file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          this._overrides.set(key, img);
          this._saveOverrides();
          eventBus.emit('sprites:changed');
          resolve();
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /** Remove an imported override. */
  remove(key) {
    if (!this._overrides.has(key)) return;
    this._overrides.delete(key);
    this._saveOverrides();
    eventBus.emit('sprites:changed');
  }

  hasOverride(key) {
    return this._overrides.has(key);
  }

  getOverrideKeys() {
    return [...this._overrides.keys()];
  }

  /** All known texture keys from the manifest. */
  getManifest() {
    return ASSET_MANIFEST;
  }
}
