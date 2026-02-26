import { eventBus } from './EventBus.js';
import { ENEMY_TYPES } from '../../utils/constants.js';
import { mapToAscii } from '../../utils/pathTracer.js';

const LS_KEY = 'td_editor_autosave';
const TEMP_KEY = 'td_editor_temp_level';

export default class LevelSerializer {
  constructor(project) {
    this.project = project;
  }

  // --- Save: JSON file download + localStorage backup ---

  save() {
    const snap = this.project.snapshot();

    // Always back up to localStorage
    localStorage.setItem(LS_KEY, JSON.stringify(snap));

    // Download as JSON file
    const blob = new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snap.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    eventBus.emit('status:message', `Saved "${snap.name}"`);
  }

  // --- Load: file picker ---

  load() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (!data.map || !Array.isArray(data.map)) throw new Error('Invalid level format');
          this.project.restore(data);
          eventBus.emit('status:message', `Loaded "${data.name || file.name}"`);
        } catch (e) {
          eventBus.emit('status:message', `Load failed: ${e.message}`, '#e74c3c');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // --- Autosave to localStorage (called periodically or on changes) ---

  autosave() {
    localStorage.setItem(LS_KEY, JSON.stringify(this.project.snapshot()));
  }

  loadAutosave() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data.map || !Array.isArray(data.map)) return false;
      this.project.restore(data);
      eventBus.emit('status:message', 'Restored autosave');
      return true;
    } catch {
      return false;
    }
  }

  // --- Clipboard export (JS code snippet) ---

  _formatWavesCode(waves) {
    if (!waves || waves.length === 0) return '    waves: [],';
    // Reverse lookup: value → ENEMY_TYPES key
    const typeToConst = {};
    for (const [k, v] of Object.entries(ENEMY_TYPES)) typeToConst[v] = `ENEMY_TYPES.${k}`;

    const waveLines = waves.map(wave => {
      const groups = wave.enemies.map(g => {
        const t = typeToConst[g.type] || `'${g.type}'`;
        const parts = [`type: ${t}`, `count: ${g.count}`, `interval: ${g.interval}`];
        if (g.delay) parts.push(`delay: ${g.delay}`);
        return `          { ${parts.join(', ')} },`;
      }).join('\n');
      return `      {\n        enemies: [\n${groups}\n        ],\n      },`;
    }).join('\n');
    return `    waves: [\n${waveLines}\n    ],`;
  }

  async exportToClipboard() {
    const snap = this.project.snapshot();
    const asciiRows = mapToAscii(snap.map);
    const mapCode = asciiRows.map(r => `      '${r}',`).join('\n');
    const wpCode = snap.waypoints.map(
      w => `      { x: ${w.x}, y: ${w.y} },`
    ).join('\n');
    const wavesCode = this._formatWavesCode(snap.waves);

    const output = `  {
    name: '${snap.name}',
    startingGold: ${snap.startingGold},
    lives: ${snap.lives},
    map: parseMap([
${mapCode}
    ]),
    waypoints: [
${wpCode}
    ],
${wavesCode}
  },`;

    try {
      await navigator.clipboard.writeText(output);
      eventBus.emit('status:message', `Copied to clipboard (${snap.waypoints.length} waypoints)`);
    } catch {
      console.log('=== LEVEL EXPORT ===\n' + output);
      eventBus.emit('status:message', 'Exported to console (clipboard blocked)', '#f39c12');
    }
  }

  // --- Play in game ---

  playInGame() {
    const snap = this.project.snapshot();
    localStorage.setItem(TEMP_KEY, JSON.stringify(snap));
    window.open('./index.html?customLevel=true', '_blank');
    eventBus.emit('status:message', 'Launched game with custom level');
  }
}
