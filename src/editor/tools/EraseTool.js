import { CELL } from '../../utils/constants.js';
import Tool from './Tool.js';

export default class EraseTool extends Tool {
  constructor() {
    super('Erase', 'E', 'E');
  }

  onPointerDown(gx, gy, project) {
    project.setCell(gx, gy, CELL.EMPTY);
  }

  onPointerMove(gx, gy, project) {
    project.setCell(gx, gy, CELL.EMPTY);
  }
}
