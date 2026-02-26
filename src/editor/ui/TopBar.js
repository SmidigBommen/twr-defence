import { eventBus } from '../core/EventBus.js';

export default class TopBar {
  constructor(container, project) {
    this.el = container;
    this.project = project;
    this._build();

    eventBus.on('project:loaded', () => {
      this.nameInput.value = this.project.name;
    });
    eventBus.on('project:name:changed', (name) => {
      this.nameInput.value = name;
    });
  }

  _build() {
    const title = document.createElement('span');
    title.className = 'title';
    title.textContent = 'Level Editor';
    this.el.appendChild(title);

    const sep = document.createElement('span');
    sep.textContent = '—';
    sep.style.color = 'var(--text-dim)';
    this.el.appendChild(sep);

    this.nameInput = document.createElement('input');
    this.nameInput.className = 'name-input';
    this.nameInput.value = this.project.name;
    this.nameInput.addEventListener('change', () => {
      this.project.name = this.nameInput.value || 'Untitled';
      eventBus.emit('project:name:changed', this.project.name);
    });
    this.el.appendChild(this.nameInput);

    const spacer = document.createElement('span');
    spacer.className = 'spacer';
    this.el.appendChild(spacer);

    this._btn('Save', () => eventBus.emit('project:save'));
    this._btn('Load', () => eventBus.emit('project:load'));
    this._btn('Export', () => eventBus.emit('project:export'));

    const playBtn = this._btn('Play', () => eventBus.emit('project:play'));
    playBtn.classList.add('primary');

    this._btn('Menu', () => { window.location.href = './index.html'; });
  }

  _btn(label, cb) {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = label;
    btn.addEventListener('click', cb);
    this.el.appendChild(btn);
    return btn;
  }
}
