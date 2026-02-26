import { eventBus } from './EventBus.js';

const MAX_HISTORY = 50;

export default class HistoryManager {
  constructor(project) {
    this.project = project;
    this.undoStack = [];
    this.redoStack = [];
  }

  pushState() {
    this.undoStack.push(this.project.snapshot());
    if (this.undoStack.length > MAX_HISTORY) this.undoStack.shift();
    this.redoStack.length = 0;
    eventBus.emit('history:changed', this.canUndo(), this.canRedo());
  }

  undo() {
    if (!this.canUndo()) return;
    this.redoStack.push(this.project.snapshot());
    this.project.restore(this.undoStack.pop());
    eventBus.emit('history:changed', this.canUndo(), this.canRedo());
  }

  redo() {
    if (!this.canRedo()) return;
    this.undoStack.push(this.project.snapshot());
    this.project.restore(this.redoStack.pop());
    eventBus.emit('history:changed', this.canUndo(), this.canRedo());
  }

  canUndo() { return this.undoStack.length > 0; }
  canRedo() { return this.redoStack.length > 0; }
}
