var structureTypes = {};
structureTypes[STRUCTURE_EXTENSION] = function() {
  if (this.room.canBuildExtension()) {
    this.room.createConstructionSite(this.pos.x - 1, this.pos.y - 1, STRUCTURE_EXTENSION);
    this.room.createConstructionSite(this.pos.x - 1, this.pos.y + 1, STRUCTURE_EXTENSION);
  }
};

Structure.prototype.work = function() {
  if (structureTypes[this.structureType]) {
    structureTypes[this.structureType].call(this);
  }
};
