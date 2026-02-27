import { ENEMY_TYPES } from '../../utils/constants.js';
import { ENEMY_DATA } from '../../data/enemies.js';
import { eventBus } from '../core/EventBus.js';

const ENEMY_OPTIONS = Object.entries(ENEMY_TYPES).map(([constName, id]) => ({
  id,
  name: ENEMY_DATA[id]?.name || constName,
}));

const DEFAULT_GROUP = { type: ENEMY_TYPES.GOBLIN, count: 5, interval: 800, delay: 0 };

export default class WaveEditor {
  constructor(container, project, history, spriteLoader) {
    this.el = container;
    this.project = project;
    this.history = history;
    this.spriteLoader = spriteLoader;
    this._build();
    eventBus.on('project:loaded', () => this._rebuild());
    eventBus.on('sprites:changed', () => this._refreshPreviews());
    eventBus.on('monsters:changed', () => this._rebuild());
  }

  _build() {
    this.el.innerHTML = '';

    // Top actions
    const top = document.createElement('div');
    top.className = 'wave-editor-top';
    const addBtn = document.createElement('button');
    addBtn.className = 'btn';
    addBtn.textContent = '+ Wave';
    addBtn.addEventListener('click', () => this._addWave());
    top.appendChild(addBtn);

    const countLabel = document.createElement('span');
    countLabel.style.cssText = 'font-size:10px; color:var(--text-dim); align-self:center;';
    countLabel.textContent = `${this.project.waves.length} waves`;
    top.appendChild(countLabel);
    this._countLabel = countLabel;
    this.el.appendChild(top);

    // Wave cards container
    this._listEl = document.createElement('div');
    this.el.appendChild(this._listEl);
    this._renderWaves();
  }

  _rebuild() {
    this._countLabel.textContent = `${this.project.waves.length} waves`;
    this._renderWaves();
  }

  _renderWaves() {
    this._listEl.innerHTML = '';
    this._previews = [];
    this.project.waves.forEach((wave, wi) => {
      this._listEl.appendChild(this._buildWaveCard(wave, wi));
    });
  }

  _buildWaveCard(wave, waveIndex) {
    const card = document.createElement('div');
    card.className = 'wave-card';

    // Header
    const header = document.createElement('div');
    header.className = 'wave-card-header';
    const title = document.createElement('span');
    title.textContent = `Wave ${waveIndex + 1}`;
    header.appendChild(title);

    const headerBtns = document.createElement('span');
    const addGrpBtn = document.createElement('button');
    addGrpBtn.className = 'btn-xs';
    addGrpBtn.textContent = '+Grp';
    addGrpBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._addGroup(waveIndex);
    });
    headerBtns.appendChild(addGrpBtn);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-xs danger';
    removeBtn.textContent = '\u00D7';
    removeBtn.style.marginLeft = '4px';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._removeWave(waveIndex);
    });
    headerBtns.appendChild(removeBtn);
    header.appendChild(headerBtns);
    card.appendChild(header);

    // Body (collapsible)
    const body = document.createElement('div');
    body.className = 'wave-card-body';

    wave.enemies.forEach((group, gi) => {
      body.appendChild(this._buildGroup(group, waveIndex, gi));
    });

    card.appendChild(body);

    // Toggle collapse
    header.addEventListener('click', () => {
      body.style.display = body.style.display === 'none' ? '' : 'none';
    });

    return card;
  }

  _buildGroup(group, waveIndex, groupIndex) {
    const el = document.createElement('div');
    el.className = 'wave-group';

    // Row 1: type select + preview + remove
    const typeSelect = document.createElement('select');
    // Built-in enemies
    const builtinGrp = document.createElement('optgroup');
    builtinGrp.label = 'Built-in';
    for (const opt of ENEMY_OPTIONS) {
      const o = document.createElement('option');
      o.value = opt.id;
      o.textContent = opt.name;
      if (opt.id === group.type) o.selected = true;
      builtinGrp.appendChild(o);
    }
    typeSelect.appendChild(builtinGrp);
    // Custom enemies from project
    if (this.project.customEnemies && this.project.customEnemies.length > 0) {
      const customGrp = document.createElement('optgroup');
      customGrp.label = 'Custom';
      for (const def of this.project.customEnemies) {
        const o = document.createElement('option');
        o.value = def.id;
        o.textContent = def.name;
        if (def.id === group.type) o.selected = true;
        customGrp.appendChild(o);
      }
      typeSelect.appendChild(customGrp);
    }
    typeSelect.addEventListener('change', () => {
      this._pushAndModify(waveIndex, groupIndex, 'type', typeSelect.value);
      this._drawPreview(preview, typeSelect.value);
    });
    el.appendChild(typeSelect);

    const preview = document.createElement('canvas');
    preview.width = 16;
    preview.height = 16;
    preview.style.cssText = 'width:16px;height:16px;';
    this._drawPreview(preview, group.type);
    this._previews.push({ canvas: preview, type: group.type, waveIndex, groupIndex });
    el.appendChild(preview);

    const rmBtn = document.createElement('button');
    rmBtn.className = 'btn-xs danger';
    rmBtn.textContent = '\u00D7';
    rmBtn.addEventListener('click', () => this._removeGroup(waveIndex, groupIndex));
    el.appendChild(rmBtn);

    // Row 2: count
    el.appendChild(this._label('Cnt'));
    el.appendChild(this._numInput(group.count, 1, 999, (v) => this._pushAndModify(waveIndex, groupIndex, 'count', v)));
    el.appendChild(document.createElement('span')); // spacer

    // Row 3: interval
    el.appendChild(this._label('Int'));
    el.appendChild(this._numInput(group.interval, 100, 30000, (v) => this._pushAndModify(waveIndex, groupIndex, 'interval', v)));
    el.appendChild(document.createElement('span'));

    // Row 4: delay
    el.appendChild(this._label('Dly'));
    el.appendChild(this._numInput(group.delay || 0, 0, 30000, (v) => this._pushAndModify(waveIndex, groupIndex, 'delay', v)));
    el.appendChild(document.createElement('span'));

    return el;
  }

  _label(text) {
    const lbl = document.createElement('label');
    lbl.textContent = text;
    return lbl;
  }

  _numInput(value, min, max, onChange) {
    const input = document.createElement('input');
    input.type = 'number';
    input.value = value;
    input.min = min;
    input.max = max;
    input.addEventListener('change', () => {
      const v = Math.max(min, Math.min(max, parseInt(input.value, 10) || min));
      input.value = v;
      onChange(v);
    });
    return input;
  }

  _drawPreview(canvas, enemyType) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 16, 16);
    // Look up sprite key: check built-ins first, then custom enemies
    const builtIn = ENEMY_DATA[enemyType];
    const custom = this.project.customEnemies?.find(d => d.id === enemyType);
    const spriteKey = builtIn?.sprite ?? custom?.sprite;
    const img = spriteKey ? this.spriteLoader.get(spriteKey) : null;
    if (img) {
      ctx.drawImage(img, 0, 0, 16, 16);
    } else {
      ctx.fillStyle = '#555';
      ctx.fillRect(0, 0, 16, 16);
    }
  }

  _refreshPreviews() {
    if (!this._previews) return;
    for (const p of this._previews) {
      // Re-read type in case it changed
      const wave = this.project.waves[p.waveIndex];
      if (wave && wave.enemies[p.groupIndex]) {
        p.type = wave.enemies[p.groupIndex].type;
      }
      this._drawPreview(p.canvas, p.type);
    }
  }

  _pushAndModify(waveIndex, groupIndex, field, value) {
    this.history.pushState();
    this.project.waves[waveIndex].enemies[groupIndex][field] = value;
    eventBus.emit('waves:changed');
  }

  _addWave() {
    this.history.pushState();
    this.project.waves.push({ enemies: [{ ...DEFAULT_GROUP }] });
    eventBus.emit('waves:changed');
    this._rebuild();
  }

  _removeWave(index) {
    this.history.pushState();
    this.project.waves.splice(index, 1);
    eventBus.emit('waves:changed');
    this._rebuild();
  }

  _addGroup(waveIndex) {
    this.history.pushState();
    this.project.waves[waveIndex].enemies.push({ ...DEFAULT_GROUP });
    eventBus.emit('waves:changed');
    this._rebuild();
  }

  _removeGroup(waveIndex, groupIndex) {
    this.history.pushState();
    this.project.waves[waveIndex].enemies.splice(groupIndex, 1);
    if (this.project.waves[waveIndex].enemies.length === 0) {
      this.project.waves.splice(waveIndex, 1);
    }
    eventBus.emit('waves:changed');
    this._rebuild();
  }
}
