var structureTypes = {};
structureTypes[STRUCTURE_EXTENSION] = function() {
  if (this.room.canBuildExtension()) {
    this.room.createConstructionSite(this.pos.x - 1, this.pos.y - 1, STRUCTURE_EXTENSION);
  }
  if (this.room.canBuildExtension()) {
    this.room.createConstructionSite(this.pos.x - 1, this.pos.y + 1, STRUCTURE_EXTENSION);
  }
};

structureTypes[STRUCTURE_LINK] = function() {
  if (!this.isControllerLink() && !this.cooldown && this.room.getControllerLink() && this.room.getControllerLink().energy < 100  && this.isFull()) {
    this.transferEnergy(this.room.getControllerLink());
  }
};

Structure.prototype.work = function() {
  if (structureTypes[this.structureType]) {
    structureTypes[this.structureType].call(this);
  }
};

Structure.prototype.isControllerLink = function() {
  return this.structureType === STRUCTURE_LINK && this.pos.getRangeTo(this.room.controller) < 5;
};

Structure.prototype.isFull = function() {
  return this.energy < this.energyCapacity;
};
