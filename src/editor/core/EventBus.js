class EventBus {
  constructor() {
    this._listeners = {};
  }

  on(event, fn) {
    (this._listeners[event] ||= []).push(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    const list = this._listeners[event];
    if (!list) return;
    const i = list.indexOf(fn);
    if (i !== -1) list.splice(i, 1);
  }

  emit(event, ...args) {
    const list = this._listeners[event];
    if (!list) return;
    for (const fn of list) fn(...args);
  }
}

export const eventBus = new EventBus();
