import { CELL } from '../../utils/constants.js';
import { eventBus } from '../core/EventBus.js';

const TILES = [
  { id: CELL.EMPTY,  label: 'Grass',  key: '1', color: '#3e8948' },
  { id: CELL.PATH,   label: 'Path',   key: '2', color: '#8b6914' },
  { id: CELL.BUILD,  label: 'Build',  key: '3', color: '#7f8c8d' },
  { id: CELL.TREES,  label: 'Trees',  key: '4', color: '#265c42' },
  { id: CELL.ROCKS,  label: 'Rocks',  key: '5', color: '#3a3a5c' },
  { id: CELL.WATER,  label: 'Water',  key: '6', color: '#0099db' },
  { id: CELL.START,  label: 'Start',  key: '7', color: '#2ecc71' },
  { id: CELL.END,    label: 'End',    key: '8', color: '#ffd700' },
  { id: CELL.BRIDGE, label: 'Bridge', key: '9', color: '#b8860b' },
];

export default class TilePalette {
  constructor(container, project) {
    this.el = container;
    this.project = project;
    this.activeTileId = CELL.PATH;
    this.cards = {};
    this._build();

    eventBus.on('project:loaded', () => this._syncProps());
  }

  _build() {
    // Tiles heading
    this._heading('Tiles');
    const list = document.createElement('div');
    list.className = 'tile-list';

    for (const t of TILES) {
      const card = document.createElement('div');
      card.className = 'tile-card' + (t.id === this.activeTileId ? ' active' : '');
      card.innerHTML = `<div class="swatch" style="background:${t.color}"></div>${t.label}<span class="key">${t.key}</span>`;
      card.addEventListener('click', () => eventBus.emit('tile:select', t.id));
      list.appendChild(card);
      this.cards[t.id] = card;
    }
    this.el.appendChild(list);

    // Properties
    this._heading('Properties');
    const props = document.createElement('div');
    props.className = 'props';

    this.nameInput = this._propRow(props, 'Name', 'text', this.project.name);
    this.goldInput = this._propRow(props, 'Gold', 'number', this.project.startingGold);
    this.livesInput = this._propRow(props, 'Lives', 'number', this.project.lives);

    this.nameInput.addEventListener('change', () => {
      this.project.name = this.nameInput.value || 'Untitled';
      eventBus.emit('project:name:changed', this.project.name);
    });
    this.goldInput.addEventListener('change', () => {
      this.project.startingGold = parseInt(this.goldInput.value, 10) || 100;
    });
    this.livesInput.addEventListener('change', () => {
      this.project.lives = parseInt(this.livesInput.value, 10) || 20;
    });

    this.el.appendChild(props);

    // Actions
    this._heading('Actions');
    const actions = document.createElement('div');
    actions.className = 'actions';
    this._actionBtn(actions, 'Auto Trace', () => eventBus.emit('action:autoTrace'));
    this._actionBtn(actions, 'Test Path', () => eventBus.emit('action:testPath'));
    this._actionBtn(actions, 'Validate', () => eventBus.emit('action:validate'));
    this._actionBtn(actions, 'Clear Path', () => eventBus.emit('action:clearPath'));
    this._actionBtn(actions, 'Clear Waypoints', () => eventBus.emit('action:clearWaypoints'));
    this.el.appendChild(actions);

    // Load campaign levels
    this._heading('Load Campaign');
    const loadActions = document.createElement('div');
    loadActions.className = 'actions';
    for (let i = 1; i <= 6; i++) {
      this._actionBtn(loadActions, `Level ${i}`, () => eventBus.emit('action:loadCampaign', i));
    }
    this.el.appendChild(loadActions);
  }

  _heading(text) {
    const h = document.createElement('div');
    h.className = 'panel-heading';
    h.textContent = text;
    this.el.appendChild(h);
  }

  _propRow(parent, label, type, value) {
    const row = document.createElement('div');
    row.className = 'prop-row';
    const lbl = document.createElement('label');
    lbl.textContent = label;
    const input = document.createElement('input');
    input.type = type;
    input.value = value;
    row.appendChild(lbl);
    row.appendChild(input);
    parent.appendChild(row);
    return input;
  }

  _actionBtn(parent, label, cb) {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = label;
    btn.addEventListener('click', cb);
    parent.appendChild(btn);
    return btn;
  }

  setActiveTile(id) {
    this.activeTileId = id;
    for (const [key, card] of Object.entries(this.cards)) {
      card.classList.toggle('active', parseInt(key) === id);
    }
  }

  _syncProps() {
    this.nameInput.value = this.project.name;
    this.goldInput.value = this.project.startingGold;
    this.livesInput.value = this.project.lives;
  }
}
