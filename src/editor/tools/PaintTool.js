import { CELL } from '../../utils/constants.js';
import Tool from './Tool.js';

export default class PaintTool extends Tool {
  constructor() {
    super('Paint', 'B', 'B');
    this.activeTile = CELL.PATH;
  }

  onPointerDown(gx, gy, project) {
    this._paint(gx, gy, project);
  }

  onPointerMove(gx, gy, project) {
    this._paint(gx, gy, project);
  }

  _paint(gx, gy, project) {
    if (this.activeTile === CELL.START || this.activeTile === CELL.END) {
      project.setUniqueCell(gx, gy, this.activeTile);
    } else {
      project.setCell(gx, gy, this.activeTile);
    }
  }
}
