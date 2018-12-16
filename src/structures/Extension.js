import './_base';

export default class Extension extends StructureExtension {
  performRole() {
    const { x, y, roomName } = this.pos;
    const positionsToBuildAt = [
      new RoomPosition(x - 1, y - 1, roomName),
      new RoomPosition(x - 1, y + 1, roomName),
    ]
    if (this.room.canBuildExtension()) {
      positionsToBuildAt.forEach(position => {
        if (!this.room.controller || position.getRangeTo(this.room.controller) > 2) {
          this.room.createConstructionSite(position.x, position.y, STRUCTURE_EXTENSION);
        }
      });
    }
  }
}
