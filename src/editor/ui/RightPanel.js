const TABS = [
  { id: 'map', label: 'Map' },
  { id: 'sprites', label: 'Sprites' },
  { id: 'waves', label: 'Waves' },
  { id: 'monsters', label: 'Monsters' },
];

export default class RightPanel {
  constructor(container) {
    this.container = container;
    this.tabs = {};
    this.contents = {};
    this._build();
  }

  _build() {
    // Clear existing content
    this.container.innerHTML = '';

    // Tab bar
    const bar = document.createElement('div');
    bar.className = 'tab-bar';

    for (const tab of TABS) {
      const btn = document.createElement('button');
      btn.textContent = tab.label;
      btn.dataset.tab = tab.id;
      btn.addEventListener('click', () => this._activate(tab.id));
      bar.appendChild(btn);
      this.tabs[tab.id] = btn;
    }
    this.container.appendChild(bar);

    // Content panels
    for (const tab of TABS) {
      const div = document.createElement('div');
      div.className = 'tab-content';
      div.dataset.tab = tab.id;
      this.container.appendChild(div);
      this.contents[tab.id] = div;
    }

    // Default to Map tab
    this._activate('map');
  }

  _activate(id) {
    for (const [key, btn] of Object.entries(this.tabs)) {
      btn.classList.toggle('active', key === id);
    }
    for (const [key, div] of Object.entries(this.contents)) {
      div.classList.toggle('active', key === id);
    }
  }

  /** Returns the content div for the given tab id. */
  getContent(id) {
    return this.contents[id] || null;
  }
}
