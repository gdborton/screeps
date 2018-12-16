// Because structures have an inheritance chain (Gparent > parent > child),
// it is difficult to properly extend their classes.

/* @flow */
import { Structure } from 'screeps-globals';
import structureManager from '../utils/structure-manager';

Object.assign(Structure.prototype, {
  work() {
    if (this.performRole) {
      this.performRole();
    }
    if (Game.time % 100 === 0) {
      this.buildAccessRoads();
    }
  },

  enhance() {
    return structureManager.enhanceStructure(this);
  },

  isFull() {
    if (this.energyCapacity) {
      return this.energy === this.energyCapacity;
    } else if (this.storeCapacity) {
      return this.totalUtilizedCapacity() === this.storeCapacity;
    }
    return true;
  },

  totalUtilizedCapacity() {
    if (this.store) {
      return Object.entries(this.store).reduce((acc, [key, val]) => {
        return acc + val;
      }, 0);
    }
    if (this.energy) return this.energy;
  },

  availableEnergy() {
    if (this.store) {
      return this.store[RESOURCE_ENERGY];
    }
    return this.energy || 0;
  },

  needsRepaired() {
    return this.hits / this.hitsMax < 1;
  },

  // Towers are great for repairing things quickly, but aren't effecient for energy.
  // Individual structures can override this to prevent waste. See walls.
  needsTowerRepaired() {
    return this.hits / this.hitsMax < 1;
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

  needsEnergy() {
    if (!(this.store || this.energyCapacity)) return false;
    if (this.structureType === STRUCTURE_TERMINAL) return false;
    if (this.structureType === STRUCTURE_CONTAINER) return false;

    if (this.structureType === STRUCTURE_STORAGE) {
      return this.room.energyAvailable === this.room.energyCapacityAvailable;
    };
    if (this.store) {
      return this.store[RESOURCE_ENERGY] < this.storeCapacity;
    }

    return this.energy < this.energyCapacity;
  },
});
