import { ASSET_MANIFEST } from '../../data/assetManifest.js';
import { TOWER_DATA } from '../../data/towers.js';
import { ENEMY_DATA } from '../../data/enemies.js';
import { eventBus } from '../core/EventBus.js';

const CARD_SIZE = 24;

// Category display config
const CATEGORIES = [
  { id: 'tile', label: 'Tiles' },
  { id: 'tower', label: 'Towers' },
  { id: 'enemy', label: 'Enemies' },
  { id: 'projectile', label: 'Projectiles' },
  { id: 'icon', label: 'Icons' },
];

// Tile keys that should emit tile:select
const TILE_KEY_TO_CELL = {
  tile_grass: 0, tile_path: 1, tile_build: 2, tile_water: 3,
  tile_trees: 4, tile_rocks: 5, tile_castle: 7,
};

export default class SpriteLibrary {
  constructor(container, spriteLoader) {
    this.el = container;
    this.spriteLoader = spriteLoader;
    this._canvases = new Map();
    this._cards = new Map();       // key → card element
    this._selectedKey = null;
    this._build();
    eventBus.on('sprites:changed', () => this._refresh());
  }

  _build() {
    // Import section
    this._buildImport();

    // Group manifest entries by category
    const grouped = {};
    for (const entry of ASSET_MANIFEST) {
      (grouped[entry.category] || (grouped[entry.category] = [])).push(entry);
    }

    for (const cat of CATEGORIES) {
      const entries = grouped[cat.id];
      if (!entries) continue;

      const section = document.createElement('div');
      section.className = 'sprite-category';

      const header = document.createElement('div');
      header.className = 'sprite-category-header';
      const arrow = document.createElement('span');
      arrow.className = 'arrow';
      arrow.textContent = '\u25BC';
      header.appendChild(arrow);
      header.appendChild(document.createTextNode(` ${cat.label} (${entries.length})`));
      section.appendChild(header);

      const grid = document.createElement('div');
      grid.className = 'sprite-grid';

      for (const entry of entries) {
        grid.appendChild(this._buildCard(entry, cat.id));
      }

      section.appendChild(grid);
      this.el.appendChild(section);

      // Collapsible toggle
      header.addEventListener('click', () => {
        const hidden = grid.style.display === 'none';
        grid.style.display = hidden ? '' : 'none';
        arrow.textContent = hidden ? '\u25BC' : '\u25B6';
      });
    }
  }

  _buildImport() {
    const wrap = document.createElement('div');
    wrap.className = 'sprite-import';

    this._selLabel = document.createElement('span');
    this._selLabel.style.cssText = 'font-size:10px;color:var(--text-dim);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    this._selLabel.textContent = 'Click a sprite\u2026';
    wrap.appendChild(this._selLabel);

    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'Import';
    btn.addEventListener('click', () => {
      if (!this._selectedKey) {
        eventBus.emit('status:message', 'Click a sprite first', '#f39c12');
        return;
      }
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.png';
      input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        try {
          await this.spriteLoader.import(this._selectedKey, file);
          eventBus.emit('status:message', `Imported ${this._selectedKey}`);
        } catch (e) {
          eventBus.emit('status:message', `Import failed: ${e.message}`, '#e74c3c');
        }
      };
      input.click();
    });
    wrap.appendChild(btn);

    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn';
    resetBtn.textContent = 'Reset';
    resetBtn.addEventListener('click', () => {
      if (!this._selectedKey) {
        eventBus.emit('status:message', 'Click a sprite first', '#f39c12');
        return;
      }
      if (!this.spriteLoader.hasOverride(this._selectedKey)) {
        eventBus.emit('status:message', `No override for ${this._selectedKey}`, '#f39c12');
        return;
      }
      this.spriteLoader.remove(this._selectedKey);
      eventBus.emit('status:message', `Reset ${this._selectedKey} to default`);
    });
    wrap.appendChild(resetBtn);

    this.el.appendChild(wrap);
  }

  _selectSprite(key) {
    this._selectedKey = key;
    this._selLabel.textContent = key;
    // Update visual selection
    for (const [k, card] of this._cards) {
      card.classList.toggle('selected', k === key);
    }
  }

  _buildCard(entry, catId) {
    const card = document.createElement('div');
    card.className = 'sprite-card';
    if (this.spriteLoader.hasOverride(entry.key)) card.classList.add('has-override');

    const canvas = document.createElement('canvas');
    canvas.width = CARD_SIZE;
    canvas.height = CARD_SIZE;
    card.appendChild(canvas);
    this._canvases.set(entry.key, canvas);
    this._cards.set(entry.key, card);
    this._drawCard(canvas, entry.key);

    const name = document.createElement('div');
    name.className = 'sprite-name';
    name.textContent = entry.key.replace(/^(tile_|tower_|enemy_|proj_|icon_)/, '');
    card.appendChild(name);

    // Stats for towers/enemies
    const stat = this._getStat(entry.key, catId);
    if (stat) {
      const statEl = document.createElement('div');
      statEl.className = 'sprite-stat';
      statEl.textContent = stat;
      card.appendChild(statEl);
    }

    // Click: select this sprite as import target (+ tile select for tile cards)
    card.addEventListener('click', () => {
      this._selectSprite(entry.key);
      if (catId === 'tile' && entry.key in TILE_KEY_TO_CELL) {
        eventBus.emit('tile:select', TILE_KEY_TO_CELL[entry.key]);
      }
    });

    // Right-click: reset override to default
    card.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (!this.spriteLoader.hasOverride(entry.key)) return;
      this.spriteLoader.remove(entry.key);
      eventBus.emit('status:message', `Reset ${entry.key} to default`);
    });

    return card;
  }

  _getStat(key, catId) {
    if (catId === 'tower') {
      const data = Object.values(TOWER_DATA).find(d => d.icon === key);
      if (data) return `${data.cost}g`;
    }
    if (catId === 'enemy') {
      const data = Object.values(ENEMY_DATA).find(d => d.sprite === key);
      if (data) return `${data.hp}hp ${data.speed}spd`;
    }
    return null;
  }

  _drawCard(canvas, key) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, CARD_SIZE, CARD_SIZE);
    const img = this.spriteLoader.get(key);
    if (img) {
      ctx.drawImage(img, 0, 0, CARD_SIZE, CARD_SIZE);
    } else {
      ctx.fillStyle = '#333';
      ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);
      ctx.fillStyle = '#666';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', CARD_SIZE / 2, CARD_SIZE / 2);
    }
  }

  _refresh() {
    for (const [key, canvas] of this._canvases) {
      this._drawCard(canvas, key);
    }
    // Update override highlights
    const cards = this.el.querySelectorAll('.sprite-card');
    for (const card of cards) {
      const canvas = card.querySelector('canvas');
      if (!canvas) continue;
      for (const [key, c] of this._canvases) {
        if (c === canvas) {
          card.classList.toggle('has-override', this.spriteLoader.hasOverride(key));
          break;
        }
      }
    }
  }
}
