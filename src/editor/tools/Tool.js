export default class Tool {
  constructor(name, icon, shortcut) {
    this.name = name;
    this.icon = icon;
    this.shortcut = shortcut;
  }

  onPointerDown(gx, gy, project) {}
  onPointerMove(gx, gy, project) {}
  onPointerUp(gx, gy, project) {}
}
