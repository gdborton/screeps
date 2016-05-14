/* @flow */
import { Structure } from 'screeps-globals';

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
      this.transfer(this.room.getControllerLink(), RESOURCE_ENERGY);
    }
  },

  [STRUCTURE_TOWER]() {
    if (this.room.hasHostileCreeps() && !this.isEmpty()) {
      this.attack(this.pos.findClosestByRange(this.room.getHostileCreeps()));
    } else if (this.energy > this.energyCapacity / 2) {
      const buildings = this.room.damagedBuildings().sort((buildingA, buildingB) => {
        return buildingA.hits - buildingB.hits;
      });
      if (buildings.length) {
        this.repair(buildings[0]);
      }
    }
  },
};

Object.assign(Structure.prototype, {
  work() {
    if (structureTypes[this.structureType]) {
      structureTypes[this.structureType].call(this);
    }
    if (Game.time % 100 === 0) {
      this.buildAccessRoads();
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

  isSourceTower() {
    const sourcesNearby = this.room.getSources().filter(source => {
      return source.pos.getRangeTo(this) <= 2;
    });

    return this.structureType === STRUCTURE_TOWER && sourcesNearby.length > 0;
  },

  buildAccessRoads() {
    const top = new RoomPosition(this.pos.x, this.pos.y - 1, this.room.name);
    const left = new RoomPosition(this.pos.x - 1, this.pos.y, this.room.name);
    const right = new RoomPosition(this.pos.x + 1, this.pos.y, this.room.name);
    const bottom = new RoomPosition(this.pos.x, this.pos.y + 1, this.room.name);
    const positions = [top, left, right, bottom];
    positions.forEach(position => {
      const terrain = position.lookFor('terrain');
      if (terrain === 'swamp' && position.isOpen() && !position.hasRoad()) {
        this.room.createConstructionSite(position.x, position.y, STRUCTURE_ROAD);
      }
    });
  },
});
