import './_base';

export default class Extension extends StructureExtension {
  performRole() {
    if (Game.time % 10 === 0) {
      if (this.room.canBuildExtension()) {
        this.room.createConstructionSite(this.pos.x - 1, this.pos.y - 1, STRUCTURE_EXTENSION);
      }
      if (this.room.canBuildExtension()) {
        this.room.createConstructionSite(this.pos.x - 1, this.pos.y + 1, STRUCTURE_EXTENSION);
      }
    }
  }
}
