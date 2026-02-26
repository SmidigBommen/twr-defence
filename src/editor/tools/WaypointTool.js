import Tool from './Tool.js';

export default class WaypointTool extends Tool {
  constructor() {
    super('Waypoint', 'W', 'W');
  }

  onPointerDown(gx, gy, project) {
    // Click existing → remove, else add
    if (!project.removeWaypointAt(gx, gy)) {
      project.addWaypoint(gx, gy);
    }
  }
}
