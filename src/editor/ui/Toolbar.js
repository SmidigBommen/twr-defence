import { eventBus } from '../core/EventBus.js';

const TOOL_DEFS = [
  { id: 'paint', label: 'PAINT', shortcut: 'B' },
  { id: 'erase', label: 'ERASE', shortcut: 'E' },
  { id: 'fill',  label: 'FILL',  shortcut: 'G' },
  { id: 'waypoint', label: 'WPT', shortcut: 'W' },
];

export default class Toolbar {
  constructor(container) {
    this.el = container;
    this.buttons = {};
    this.activeId = 'paint';
    this._build();

    eventBus.on('history:changed', (canUndo, canRedo) => {
      this.undoBtn.style.opacity = canUndo ? '1' : '0.35';
      this.redoBtn.style.opacity = canRedo ? '1' : '0.35';
    });
  }

  _build() {
    for (const def of TOOL_DEFS) {
      const btn = document.createElement('button');
      btn.className = 'tool-btn' + (def.id === this.activeId ? ' active' : '');
      btn.innerHTML = `${def.label}<span class="shortcut">${def.shortcut}</span>`;
      btn.addEventListener('click', () => eventBus.emit('tool:select', def.id));
      this.el.appendChild(btn);
      this.buttons[def.id] = btn;
    }

    // Separator
    const sep = document.createElement('div');
    sep.className = 'tool-sep';
    this.el.appendChild(sep);

    // Undo / Redo / Clear
    this.undoBtn = this._actionBtn('UNDO', () => eventBus.emit('history:undo'));
    this.redoBtn = this._actionBtn('REDO', () => eventBus.emit('history:redo'));
    this._actionBtn('CLEAR', () => eventBus.emit('map:clear'));

    this.undoBtn.style.opacity = '0.35';
    this.redoBtn.style.opacity = '0.35';
  }

  _actionBtn(label, cb) {
    const btn = document.createElement('button');
    btn.className = 'tool-btn action';
    btn.textContent = label;
    btn.addEventListener('click', cb);
    this.el.appendChild(btn);
    return btn;
  }

  setActive(id) {
    this.activeId = id;
    for (const [key, btn] of Object.entries(this.buttons)) {
      btn.classList.toggle('active', key === id);
    }
  }
}
