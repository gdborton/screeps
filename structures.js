var structureTypes = {};
structureTypes[STRUCTURE_EXTENSION] = function() {
  this.room.createConstructionSite(this.pos.x - 1, this.pos.y - 1);
};

Structure.prototype.work = function() {
  if (structureTypes[this.structureType]) {
    structureTypes[this.structureType]();
  }
};
