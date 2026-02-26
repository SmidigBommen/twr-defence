import { CELL } from '../../utils/constants.js';
import { eventBus } from '../core/EventBus.js';

const CELL_NAMES = {
  [CELL.EMPTY]:  'Grass',
  [CELL.PATH]:   'Path',
  [CELL.BUILD]:  'Build',
  [CELL.WATER]:  'Water',
  [CELL.TREES]:  'Trees',
  [CELL.ROCKS]:  'Rocks',
  [CELL.START]:  'Start',
  [CELL.END]:    'End',
  [CELL.BRIDGE]: 'Bridge',
};

export default class StatusBar {
  constructor(container) {
    this.el = container;
    this._build();

    this._clearTimer = null;
    eventBus.on('cursor:move', (gx, gy, cell) => {
      this.posSpan.textContent = `X: ${gx}  Y: ${gy}`;
      this.tileSpan.textContent = CELL_NAMES[cell] || '?';
    });
    eventBus.on('cursor:leave', () => {
      this.posSpan.textContent = '';
      this.tileSpan.textContent = '';
    });
    eventBus.on('status:message', (msg, color) => {
      this.msgSpan.textContent = msg;
      this.msgSpan.style.color = color || 'var(--green)';
      clearTimeout(this._clearTimer);
      this._clearTimer = setTimeout(() => { this.msgSpan.textContent = ''; }, 3000);
    });
  }

  _build() {
    this.posSpan = document.createElement('span');
    this.tileSpan = document.createElement('span');
    this.msgSpan = document.createElement('span');
    this.msgSpan.className = 'status-msg';

    this.el.appendChild(this.posSpan);
    this.el.appendChild(this.tileSpan);
    this.el.appendChild(this.msgSpan);
  }
}
