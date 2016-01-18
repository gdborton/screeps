var structureTypes = {};
structureTypes[STRUCTURE_EXTENSION] = function() {
  if (Game.time % 10 === 0) {
    if (this.room.canBuildExtension()) {
      this.room.createConstructionSite(this.pos.x - 1, this.pos.y - 1, STRUCTURE_EXTENSION);
    }
    if (this.room.canBuildExtension()) {
      this.room.createConstructionSite(this.pos.x - 1, this.pos.y + 1, STRUCTURE_EXTENSION);
    }
  }
};

structureTypes[STRUCTURE_LINK] = function() {
  if (!this.isControllerLink() && !this.cooldown && this.room.getControllerLink() && this.room.getControllerLink().energy < 100) {
    this.transferEnergy(this.room.getControllerLink());
  }
};

structureTypes[STRUCTURE_TOWER] = function() {
  if (this.room.hasHostileCreeps() && !this.isEmpty()) {
    this.attack(this.pos.findClosest(this.room.getHostileCreeps()));
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
  if (this.energyCapacity) {
    return this.energy === this.energyCapacity;
  } else if (this.storeCapacity) {
    return this.store === this.storeCapacity;
  }
  return true;
};

Structure.prototype.isEmpty = function() {
  if (this.energyCapacity) {
    return this.energy === 0;
  } else if (this.storeCapacity) {
    return this.store === 0;
  }

  return true;
};
