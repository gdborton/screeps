/* @flow */
import settings from './settings';
import { Room } from 'screep-globals';

function getAllClaimers() {
  return Object.keys(Game.creeps).filter((creepName) => {
    const creep = Game.creeps[creepName];
    return creep.memory.role === 'claimer';
  });
}

function getAllScoutHarvesters() {
  return Object.keys(Game.creeps).filter(creepName => {
    const creep = Game.creeps[creepName];
    return creep.memory.role === 'scoutharvester' || creep.memory.oldRole === 'scoutharvester';
  });
}

function getAllScouts() {
  return Object.keys(Game.creeps).filter(creepName => {
    const creep = Game.creeps[creepName];
    return creep.memory.role === 'scout';
  });
}

Object.assign(Room.prototype, {
  work() {
    this.getMyStructures().forEach((structure) => {
      structure.work();
    });

    this.myCreeps().forEach((creep) => {
      creep.work();
    });

    this.getFlags().forEach((flag) => {
      flag.work();
    });
  },

  hasHostileCreeps() {
    return this.getHostileCreeps().length > 0;
  },

  getHostileCreeps() {
    return this.find(FIND_HOSTILE_CREEPS);
  },

  needsUpgraders() {
    const hasFreeEdges = this.upgraderCount() < this.controller.pos.freeEdges();
    return hasFreeEdges && !!this.droppedControllerEnergy() &&
      this.upgraderWorkParts() < this.maxEnergyProducedPerTick();
  },

  needsBuilders() {
    return this.builderCount() < 1 &&
      (this.getConstructionSites().length > 0 || this.damagedBuildings().length > 0);
  },

  damagedBuildings() {
    return this.getStructures().filter(structure => {
      return structure.structureType !== STRUCTURE_ROAD && structure.needsRepaired();
    });
  },

  getStorage() {
    if (!this._storageCalc) {
      this._storageCalc = true;
      this._storage = this.getMyStructures().filter(structure => {
        return structure.structureType === STRUCTURE_STORAGE;
      })[0];
    }
    return this._storage;
  },

  getLinks() {
    if (!this._links) {
      this._links = this.getMyStructures().filter(structure => {
        return structure.structureType === STRUCTURE_LINK;
      });
    }

    return this._links;
  },

  getControllerLink() {
    return this.getLinks().filter(link => {
      return link.isControllerLink();
    })[0];
  },

  upgraderWorkParts() {
    if (!this._upgraderWorkParts) {
      let parts = this.getUpgraders();
      parts = parts.map(upgrader => {
        return upgrader.body.filter(bodyPart => {
          return bodyPart.type === WORK;
        }).length;
      });

      if (parts.length) {
        this._upgraderWorkParts = parts.reduce((a, b) => { return a + b; });
      } else {
        this._upgraderWorkParts = 0;
      }
    }

    return this._upgraderWorkParts;
  },

  maxEnergyProducedPerTick() {
    return this.sourceCount() * 10;
  },

  sourceCount() {
    return this.getSources().length;
  },

  getStructures() {
    if (!this._structures) {
      this._structures = this.find(FIND_STRUCTURES);
    }
    return this._structures;
  },

  getRoads() {
    if (!this._roads) {
      this._roads = this.getStructures().filter(structure => {
        return structure.structureType === STRUCTURE_ROAD;
      });
    }

    return this._roads;
  },

  getDamagedRoads() {
    if (!this._damagedRoads) {
      this._damagedRoads = this.getRoads().filter(road => {
        return road.structureType === STRUCTURE_ROAD && road.hits / road.hitsMax < 0.5;
      });
    }

    return this._damagedRoads;
  },

  hasDamagedRoads() {
    return this.getDamagedRoads().length > 0;
  },

  needsRoadWorkers() {
    if (Game.time % 30 !== 0) {
      return false;
    }

    return this.roadWorkerCount() < 1 && this.hasDamagedRoads();
  },

  needsCouriers() {
    if (this.courierCount() === 1 && this.getCouriers()[0].ticksToLive < 70) {
      return true;
    }

    const storage = this.getStorage();
    if (!storage) {
      return this.courierCount() < 2;
    } else if (storage.store.energy > 500000) {
      return this.courierCount() < Math.floor(storage.store.energy / 200000);
    }

    return this.courierCount() < 1;
  },

  getMyStructures() {
    if (!this._myStructures) {
      this._myStructures = this.find(FIND_MY_STRUCTURES);
    }

    return this._myStructures;
  },

  getHarvesters() {
    if (!this._harvesters) {
      this._harvesters = this.myCreeps().filter((creep) => {
        return creep.memory.role === 'harvester';
      });
    }
    return this._harvesters;
  },

  getRoadWorkers() {
    if (!this._roadWorkers) {
      this._roadWorkers = this.myCreeps().filter((creep) => {
        return creep.memory.role === 'roadworker';
      });
    }

    return this._roadWorkers;
  },

  roadWorkerCount() {
    return this.getRoadWorkers().length;
  },

  harvesterCount() {
    return this.getHarvesters().length;
  },

  getMailmen() {
    if (!this._mailmen) {
      this._mailmen = this.myCreeps().filter((creep) => {
        return creep.memory.role === 'mailman';
      });
    }

    return this._mailmen;
  },

  mailmanCount() {
    return this.getMailmen().length;
  },

  getExits() {
    if (!this._exits) {
      this._exits = this.find(FIND_EXIT);
    }

    return this._exits;
  },

  getUniqueExitPoints() {
    if (!this._uniqueExitPoints) {
      const exitCoords = this.getExits();
      this._uniqueExitPoints = exitCoords.filter((coord, index) => {
        if (index === 0) {
          return true;
        }

        const prevCoord = exitCoords[index - 1];
        return !(Math.abs(coord.x - prevCoord.x) < 2) || !(Math.abs(coord.y - prevCoord.y) < 2);
      });
    }

    return this._uniqueExitPoints();
  },

  hasOutdatedCreeps() {
    return this.getOutdatedCreeps().length > 0;
  },

  getOutdatedCreeps() {
    return this.myCreeps().filter((creep) => {
      return creep.cost() <= this.getSpawn().maxEnergy() - 100;
    });
  },

  getFlags() {
    return this.find(FIND_FLAGS).filter(flag => {
      return flag.room === this;
    });
  },

  getControllerEnergyDropFlag() {
    return this.getFlags().filter(flag => {
      return flag.name.indexOf('CONTROLLER_ENERGY_DROP') !== -1;
    })[0];
  },

  workerCount() {
    return this.harvesterCount() + this.builderCount() + this.mailmanCount();
  },

  courierCount() {
    return this.getCouriers().length;
  },

  getCouriers() {
    if (!this._couriers) {
      this._couriers = this.myCreeps().filter((creep) => {
        return creep.memory.role === 'courier';
      });
    }

    return this._couriers;
  },

  myCreeps() {
    if (!this._myCreeps) {
      this._myCreeps = this.find(FIND_MY_CREEPS);
    }

    return this._myCreeps;
  },

  builderCount() {
    return this.getBuilders().length;
  },

  getBuilders() {
    if (!this._builders) {
      this._builders = this.myCreeps().filter((creep) => {
        return creep.memory.role === 'builder';
      });
    }

    return this._builders;
  },

  upgraderCount() {
    return this.getUpgraders().length;
  },

  getUpgraders() {
    if (!this._upgraders) {
      this._upgraders = this.myCreeps().filter(creep => {
        return creep.memory.role === 'upgrader';
      });
    }
    return this._upgraders;
  },

  getConstructionSites() {
    return this.find(FIND_CONSTRUCTION_SITES);
  },

  getSources() {
    if (!this._sources) {
      this._sources = this.find(FIND_SOURCES);
    }

    return this._sources;
  },

  getSourcesNeedingHarvesters() {
    return this.getSources().filter(source => {
      return source.needsHarvesters();
    });
  },

  needsHarvesters() {
    return this.getSourcesNeedingHarvesters().length > 0;
  },

  getEnergySourceStructures() {
    return this.getMyStructures().filter(structure => {
      return structure.energy;
    });
  },

  droppedControllerEnergy() {
    if (!this._droppedControllerEnergy) {
      const dumpFlag = this.getControllerEnergyDropFlag();
      this._droppedControllerEnergy = this.find(FIND_DROPPED_ENERGY).filter(energy => {
        return energy.pos.getRangeTo(dumpFlag) === 0;
      })[0];
    }

    return this._droppedControllerEnergy;
  },

  getEnergyStockSources() {
    if (!this._energyStockSources) {
      const droppedControllerEnergy = this.droppedControllerEnergy();
      this._energyStockSources = this.getEnergySourceStructures();
      if (droppedControllerEnergy) {
        this._energyStockSources.unshift(droppedControllerEnergy);
      }
    }

    return this._energyStockSources;
  },

  getSpawn() {
    const spawns = this.find(FIND_MY_SPAWNS);
    if (spawns.length) {
      return spawns[0];
    }

    return spawns;
  },

  canBuildExtension() {
    if (this._canBuildExtensions === undefined) {
      const maxExtensions = settings.buildingCount[this.controller.level].extensions || 0;
      this._canBuildExtensions = this.getExtensions().length < maxExtensions;
    }
    return this._canBuildExtensions;
  },

  getExtensions() {
    if (!this._extensions) {
      this._extensions = this.getMyStructures().filter(structure => {
        return structure.structureType === STRUCTURE_EXTENSION;
      });
    }

    return this._extensions;
  },

  courierTargets() {
    return this.getCouriers().filter(creep => {
      return creep.memory.role === 'courier' && !!creep.memory.target;
    }).map(courier => {
      return courier.memory.target;
    });
  },

  getCreepsThatNeedOffloading() {
    const targets = this.courierTargets();
    return this.getHarvesters().filter(harvester => {
      const targeted = targets.indexOf(harvester.id) !== -1;
      return harvester.needsOffloaded() && !targeted;
    });
  },

  getDroppedEnergy() {
    return this.find(FIND_DROPPED_ENERGY).sort((energyA, energyB) => {
      return energyB.energy - energyA.energy;
    });
  },

  getEnergyThatNeedsPickedUp() {
    const targets = this.courierTargets();
    const dumpFlag = this.getControllerEnergyDropFlag();

    return this.getDroppedEnergy().filter(energy => {
      const targeted = targets.indexOf(energy.id) !== -1;
      return !targeted && energy.pos.getRangeTo(dumpFlag) !== 0;
    });
  },

  getControllerOwned() {
    return this.controller.my;
  },

  getDismantleFlag() {
    return Game.dismantleFlags().filter((flag) => {
      return flag.room === this;
    })[0];
  },

  getStructureAt(roomPosition) {
    return this.getStructures().filter((structure) => {
      return structure.pos.getRangeTo(roomPosition) === 0;
    })[0];
  },

  hasScoutFlag() {
    return Game.getScoutFlags().filter((flag) => {
      return flag.room === this;
    }).length > 0;
  },

  needsScouts() {
    let desiredValue = 2;
    if (Game.dismantleFlags().length > 0) {
      desiredValue = 4;
    }
    return this.hasScoutFlag() && getAllScouts().length < desiredValue;
  },

  needsClaimers() {
    return this.hasScoutFlag() && Game.claimFlags().length > 0 && getAllClaimers().length < 1;
  },

  needsScoutHarvesters() {
    let desiredValue = 2;
    if (Game.dismantleFlags().length > 0) {
      desiredValue = 0;
    }
    return this.hasScoutFlag() && getAllScoutHarvesters().length < desiredValue;
  },

  getEnergySourcesThatNeedsStocked() {
    if (this.getEnergyThatNeedsPickedUp().length) {
      return this.getEnergyThatNeedsPickedUp();
    } else if (this.getCreepsThatNeedOffloading().length) {
      return this.getCreepsThatNeedOffloading();
    } else if (this.getStorage() && !this.getStorage().isEmpty()) {
      return [this.getStorage()];
    }

    return [];
  },
});
