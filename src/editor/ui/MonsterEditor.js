import { ASSET_MANIFEST } from '../../data/assetManifest.js';
import { eventBus } from '../core/EventBus.js';

// Only expose abilities that are actually implemented in Enemy.js
const ABILITIES = [
  {
    id: 'regenerate',
    label: 'Regenerate HP',
    fields: [
      { key: 'regenRate', label: 'Rate (HP/s)', min: 0.1, max: 50, step: 0.5, def: 2 },
    ],
  },
  {
    id: 'heal',
    label: 'Heal nearby',
    fields: [
      { key: 'healAmount', label: 'Heal (HP)', min: 1, max: 100, step: 1, def: 5 },
      { key: 'healRadius', label: 'Radius (px)', min: 10, max: 200, step: 5, def: 40 },
      { key: 'healRate', label: 'Rate (ms)', min: 500, max: 10000, step: 500, def: 2000 },
    ],
  },
];

const SPRITE_KEYS = ASSET_MANIFEST.map(e => e.key);

function newMonster() {
  return {
    id: `cx_${Date.now()}`,
    name: 'New Monster',
    sprite: 'enemy_goblin',
    hp: 50,
    speed: 30,
    gold: 8,
    damage: 1,
    size: 1,
    isFlying: false,
    isStealth: false,
    isBoss: false,
    abilities: [],
    regenRate: 2,
    healAmount: 5,
    healRadius: 40,
    healRate: 2000,
  };
}

export default class MonsterEditor {
  constructor(container, project, history, spriteLoader) {
    this.el = container;
    this.project = project;
    this.history = history;
    this.spriteLoader = spriteLoader;
    this._selected = null;
    this._build();
    eventBus.on('project:loaded', () => {
      this._selected = null;
      this._renderList();
      this._renderForm();
    });
    eventBus.on('sprites:changed', () => this._refreshPreviews());
  }

  _build() {
    this.el.innerHTML = '';

    const top = document.createElement('div');
    top.className = 'wave-editor-top';
    const addBtn = document.createElement('button');
    addBtn.className = 'btn';
    addBtn.textContent = '+ Monster';
    addBtn.addEventListener('click', () => this._addMonster());
    top.appendChild(addBtn);
    const hint = document.createElement('span');
    hint.style.cssText = 'font-size:9px;color:var(--text-dim);align-self:center;';
    hint.textContent = 'auto-saved';
    top.appendChild(hint);
    this.el.appendChild(top);

    this._listEl = document.createElement('div');
    this._listEl.className = 'monster-list';
    this.el.appendChild(this._listEl);

    this._formEl = document.createElement('div');
    this._formEl.className = 'monster-form';
    this.el.appendChild(this._formEl);

    this._previews = [];
    this._renderList();
    this._renderForm();
  }

  _renderList() {
    this._listEl.innerHTML = '';
    this._previews = [];

    if (this.project.customEnemies.length === 0) {
      const hint = document.createElement('div');
      hint.style.cssText = 'font-size:10px;color:var(--text-dim);padding:4px 8px;';
      hint.textContent = 'No custom monsters yet.';
      this._listEl.appendChild(hint);
      return;
    }

    this.project.customEnemies.forEach((m, i) => {
      const row = document.createElement('div');
      row.className = 'monster-list-row' + (i === this._selected ? ' active' : '');

      const preview = document.createElement('canvas');
      preview.width = 16;
      preview.height = 16;
      preview.style.cssText = 'width:16px;height:16px;flex-shrink:0;image-rendering:pixelated;';
      this._drawPreview(preview, m.sprite);
      this._previews.push({ canvas: preview, index: i });
      row.appendChild(preview);

      const name = document.createElement('span');
      name.textContent = m.name;
      name.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
      row.appendChild(name);

      row.addEventListener('click', () => {
        this._selected = i;
        this._renderList();
        this._renderForm();
      });
      this._listEl.appendChild(row);
    });
  }

  _renderForm() {
    this._formEl.innerHTML = '';

    const m = this._selected !== null ? this.project.customEnemies[this._selected] : null;
    if (!m) {
      const hint = document.createElement('div');
      hint.style.cssText = 'font-size:10px;color:var(--text-dim);padding:4px 8px;';
      hint.textContent = 'Select a monster to edit.';
      this._formEl.appendChild(hint);
      return;
    }

    const inner = document.createElement('div');
    inner.className = 'monster-form-inner';

    // Name
    inner.appendChild(this._row('Name', this._textInput(m.name, v => this._set('name', v))));

    // Sprite picker with live preview
    const spriteWrap = document.createElement('div');
    spriteWrap.style.cssText = 'display:flex;align-items:center;gap:4px;flex:1;min-width:0;';
    const spriteSelect = document.createElement('select');
    spriteSelect.style.cssText = 'flex:1;min-width:0;background:var(--surface2);border:1px solid var(--border);color:var(--text);font-family:monospace;font-size:10px;padding:2px 4px;outline:none;';
    for (const key of SPRITE_KEYS) {
      const o = document.createElement('option');
      o.value = key;
      o.textContent = key;
      if (key === m.sprite) o.selected = true;
      spriteSelect.appendChild(o);
    }
    const spritePrev = document.createElement('canvas');
    spritePrev.width = 16;
    spritePrev.height = 16;
    spritePrev.style.cssText = 'width:16px;height:16px;flex-shrink:0;image-rendering:pixelated;border:1px solid var(--border);';
    this._drawPreview(spritePrev, m.sprite);
    spriteSelect.addEventListener('change', () => {
      this._set('sprite', spriteSelect.value);
      this._drawPreview(spritePrev, spriteSelect.value);
      this._renderList();
    });
    spriteWrap.appendChild(spriteSelect);
    spriteWrap.appendChild(spritePrev);
    inner.appendChild(this._row('Sprite', spriteWrap));

    // Numeric stats
    inner.appendChild(this._row('HP', this._numInput(m.hp, 1, 99999, 1, v => this._set('hp', v))));
    inner.appendChild(this._row('Speed', this._numInput(m.speed, 1, 500, 1, v => this._set('speed', v))));
    inner.appendChild(this._row('Gold', this._numInput(m.gold, 0, 9999, 1, v => this._set('gold', v))));
    inner.appendChild(this._row('Damage', this._numInput(m.damage, 1, 99, 1, v => this._set('damage', v))));
    inner.appendChild(this._row('Size', this._numInput(m.size, 0.1, 5, 0.1, v => this._set('size', Math.round(v * 10) / 10))));

    // Trait checkboxes
    const flagsWrap = document.createElement('div');
    flagsWrap.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;flex:1;';
    for (const [field, label] of [['isFlying', 'Flying'], ['isStealth', 'Stealth'], ['isBoss', 'Boss']]) {
      const lbl = document.createElement('label');
      lbl.style.cssText = 'display:flex;align-items:center;gap:2px;font-size:10px;cursor:pointer;white-space:nowrap;';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = m[field];
      cb.addEventListener('change', () => this._set(field, cb.checked));
      lbl.appendChild(cb);
      lbl.appendChild(document.createTextNode(label));
      flagsWrap.appendChild(lbl);
    }
    inner.appendChild(this._row('Traits', flagsWrap));

    // Abilities section
    const abSep = document.createElement('div');
    abSep.style.cssText = 'font-size:10px;color:var(--text-dim);padding:4px 0 2px;border-top:1px solid var(--border);margin-top:2px;';
    abSep.textContent = 'Abilities';
    inner.appendChild(abSep);

    for (const ab of ABILITIES) {
      const hasIt = m.abilities.includes(ab.id);
      const abDiv = document.createElement('div');

      const headerLbl = document.createElement('label');
      headerLbl.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:10px;cursor:pointer;padding:2px 0;';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = hasIt;

      const extraDiv = document.createElement('div');
      extraDiv.style.cssText = 'margin-left:16px;' + (hasIt ? '' : 'display:none;');

      cb.addEventListener('change', () => {
        this._setAbility(ab.id, cb.checked);
        extraDiv.style.display = cb.checked ? '' : 'none';
      });
      headerLbl.appendChild(cb);
      headerLbl.appendChild(document.createTextNode(ab.label));
      abDiv.appendChild(headerLbl);

      for (const f of ab.fields) {
        extraDiv.appendChild(this._row(f.label, this._numInput(m[f.key] ?? f.def, f.min, f.max, f.step, v => this._set(f.key, v))));
      }
      abDiv.appendChild(extraDiv);
      inner.appendChild(abDiv);
    }

    // Delete
    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-danger';
    delBtn.textContent = 'Delete Monster';
    delBtn.style.cssText = 'margin-top:8px;width:100%;color:var(--red);border-color:var(--red);';
    delBtn.addEventListener('click', () => this._deleteMonster());
    inner.appendChild(delBtn);

    this._formEl.appendChild(inner);
  }

  _row(label, input) {
    const row = document.createElement('div');
    row.className = 'form-row';
    const lbl = document.createElement('label');
    lbl.textContent = label;
    row.appendChild(lbl);
    row.appendChild(input);
    return row;
  }

  _textInput(value, onChange) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    // Update list label live while typing (no history push)
    input.addEventListener('input', () => {
      if (this._selected === null) return;
      const rows = this._listEl.querySelectorAll('.monster-list-row span');
      if (rows[this._selected]) rows[this._selected].textContent = input.value || 'Monster';
    });
    input.addEventListener('change', () => onChange(input.value.trim() || 'Monster'));
    return input;
  }

  _numInput(value, min, max, step, onChange) {
    const input = document.createElement('input');
    input.type = 'number';
    input.value = value;
    input.min = min;
    input.max = max;
    input.step = step;
    input.addEventListener('change', () => {
      const v = parseFloat(input.value);
      if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
    });
    return input;
  }

  _set(field, value) {
    this.history.pushState();
    this.project.customEnemies[this._selected][field] = value;
    eventBus.emit('monsters:changed');
    this._flashSaved();
  }

  _setAbility(abilityId, on) {
    this.history.pushState();
    const m = this.project.customEnemies[this._selected];
    const abilities = [...m.abilities];
    if (on && !abilities.includes(abilityId)) {
      abilities.push(abilityId);
    } else if (!on) {
      const idx = abilities.indexOf(abilityId);
      if (idx >= 0) abilities.splice(idx, 1);
    }
    m.abilities = abilities;
    eventBus.emit('monsters:changed');
    this._flashSaved();
  }

  // Debounced status bar confirmation so rapid edits don't spam it
  _flashSaved() {
    clearTimeout(this._savedTimer);
    this._savedTimer = setTimeout(() => {
      eventBus.emit('status:message', '✓ Monster saved');
    }, 400);
  }

  _addMonster() {
    this.history.pushState();
    this.project.customEnemies.push(newMonster());
    this._selected = this.project.customEnemies.length - 1;
    eventBus.emit('monsters:changed');
    eventBus.emit('status:message', 'Monster created — edit below');
    this._renderList();
    this._renderForm();
  }

  _deleteMonster() {
    if (this._selected === null) return;
    this.history.pushState();
    const name = this.project.customEnemies[this._selected].name;
    this.project.customEnemies.splice(this._selected, 1);
    this._selected = this.project.customEnemies.length > 0
      ? Math.min(this._selected, this.project.customEnemies.length - 1)
      : null;
    eventBus.emit('monsters:changed');
    eventBus.emit('status:message', `Deleted "${name}"`);
    this._renderList();
    this._renderForm();
  }

  _drawPreview(canvas, spriteKey) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 16, 16);
    const img = spriteKey ? this.spriteLoader.get(spriteKey) : null;
    if (img) {
      ctx.drawImage(img, 0, 0, 16, 16);
    } else {
      ctx.fillStyle = '#555';
      ctx.fillRect(0, 0, 16, 16);
    }
  }

  _refreshPreviews() {
    for (const { canvas, index } of this._previews) {
      const m = this.project.customEnemies[index];
      if (m) this._drawPreview(canvas, m.sprite);
    }
  }
}
