const TEN_MILLION = 10000000;
const structureTypes = {
  [STRUCTURE_EXTENSION]() {
    if (Game.time % 10 === 0) {
      if (this.room.canBuildExtension()) {
        this.room.createConstructionSite(this.pos.x - 1, this.pos.y - 1, STRUCTURE_EXTENSION);
      }
      if (this.room.canBuildExtension()) {
        this.room.createConstructionSite(this.pos.x - 1, this.pos.y + 1, STRUCTURE_EXTENSION);
      }
    }
  },

  [STRUCTURE_LINK]() {
    const shouldTransfer = !this.isControllerLink() && !this.cooldown;
    const controllerLink = this.room.getControllerLink();
    const controllerLinkNeedsEnergy = controllerLink && controllerLink.energy < 100;
    if (shouldTransfer && controllerLinkNeedsEnergy) {
      this.transferEnergy(this.room.getControllerLink());
    }
  },

  [STRUCTURE_TOWER]() {
    if (this.room.hasHostileCreeps() && !this.isEmpty()) {
      this.attack(this.pos.findClosestByRange(this.room.getHostileCreeps()));
    }
  },
};

Object.assign(Structure.prototype, {
  work() {
    if (structureTypes[this.structureType]) {
      structureTypes[this.structureType].call(this);
    }
  },

  isControllerLink() {
    return this.structureType === STRUCTURE_LINK && this.pos.getRangeTo(this.room.controller) < 5;
  },

  isFull() {
    if (this.energyCapacity) {
      return this.energy === this.energyCapacity;
    } else if (this.storeCapacity) {
      return this.store === this.storeCapacity;
    }
    return true;
  },

  needsRepaired() {
    return this.hits / this.hitsMax < 0.9 && this.hits < TEN_MILLION;
  },

  isEmpty() {
    if (this.energyCapacity) {
      return this.energy === 0;
    } else if (this.storeCapacity) {
      return this.store === 0;
    }

    return true;
  },
});
