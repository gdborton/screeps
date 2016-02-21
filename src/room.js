import settings from './settings';

Room.prototype.work = function work() {
  this.getMyStructures().forEach((structure) => {
    structure.work();
  });

  this.myCreeps().forEach((creep) => {
    creep.work();
  });

  this.getFlags().forEach((flag) => {
    flag.work();
  });
};

Room.prototype.hasHostileCreeps = function hasHostileCreeps() {
  return this.getHostileCreeps().length > 0;
};

Room.prototype.getHostileCreeps = function getHostileCreeps() {
  return this.find(FIND_HOSTILE_CREEPS);
};

Room.prototype.needsUpgraders = function needsUpgraders() {
  const hasFreeEdges = this.upgraderCount() < this.controller.pos.freeEdges();
  return hasFreeEdges && !!this.droppedControllerEnergy() &&
    this.upgraderWorkParts() < this.maxEnergyProducedPerTick();
};

Room.prototype.needsBuilders = function needsBuilders() {
  return this.builderCount() < 1 &&
    (this.getConstructionSites().length > 0 || this.damagedBuildings().length > 0);
};

Room.prototype.damagedBuildings = function damagedBuildings() {
  return this.getStructures().filter(structure => {
    return structure.structureType !== STRUCTURE_ROAD && structure.needsRepaired();
  });
};

Room.prototype.getStorage = function getStorage() {
  if (!this._storageCalc) {
    this._storageCalc = true;
    this._storage = this.getMyStructures().filter(structure => {
      return structure.structureType === STRUCTURE_STORAGE;
    })[0];
  }
  return this._storage;
};

Room.prototype.getLinks = function getLinks() {
  if (!this._links) {
    this._links = this.getMyStructures().filter(structure => {
      return structure.structureType === STRUCTURE_LINK;
    });
  }

  return this._links;
};

Room.prototype.getControllerLink = function getControllerLink() {
  return this.getLinks().filter(link => {
    return link.isControllerLink();
  })[0];
};

Room.prototype.upgraderWorkParts = function upgraderWorkParts() {
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
};

Room.prototype.maxEnergyProducedPerTick = function maxEnergyProducedPerTick() {
  return this.sourceCount() * 10;
};

Room.prototype.sourceCount = function sourceCount() {
  return this.getSources().length;
};

Room.prototype.getStructures = function getStructures() {
  if (!this._structures) {
    this._structures = this.find(FIND_STRUCTURES);
  }
  return this._structures;
};

Room.prototype.getRoads = function getRoads() {
  if (!this._roads) {
    this._roads = this.getStructures().filter(structure => {
      return structure.structureType === STRUCTURE_ROAD;
    });
  }

  return this._roads;
};

Room.prototype.getDamagedRoads = function getDamagedRoads() {
  if (!this._damagedRoads) {
    this._damagedRoads = this.getRoads().filter(road => {
      return road.structureType === STRUCTURE_ROAD && road.hits / road.hitsMax < 0.5;
    });
  }

  return this._damagedRoads;
};

Room.prototype.hasDamagedRoads = function hasDamagedRoads() {
  return this.getDamagedRoads().length > 0;
};

Room.prototype.needsRoadWorkers = function needsRoadWorkers() {
  if (Game.time % 30 !== 0) {
    return false;
  }

  return this.roadWorkerCount() < 1 && this.hasDamagedRoads();
};

Room.prototype.needsCouriers = function needsCouriers() {
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
};

Room.prototype.getMyStructures = function getMyStructures() {
  if (!this._myStructures) {
    this._myStructures = this.find(FIND_MY_STRUCTURES);
  }

  return this._myStructures;
};

Room.prototype.getHarvesters = function getHarvesters() {
  if (!this._harvesters) {
    this._harvesters = this.myCreeps().filter((creep) => {
      return creep.memory.role === 'harvester';
    });
  }
  return this._harvesters;
};

Room.prototype.getRoadWorkers = function getRoadWorkers() {
  if (!this._roadWorkers) {
    this._roadWorkers = this.myCreeps().filter((creep) => {
      return creep.memory.role === 'roadworker';
    });
  }

  return this._roadWorkers;
};

Room.prototype.roadWorkerCount = function roadWorkerCount() {
  return this.getRoadWorkers().length;
};

Room.prototype.harvesterCount = function harvesterCount() {
  return this.getHarvesters().length;
};

Room.prototype.getMailmen = function getMailmen() {
  if (!this._mailmen) {
    this._mailmen = this.myCreeps().filter((creep) => {
      return creep.memory.role === 'mailman';
    });
  }

  return this._mailmen;
};

Room.prototype.mailmanCount = function mailmanCount() {
  return this.getMailmen().length;
};

Room.prototype.getExits = function getExits() {
  if (!this._exits) {
    this._exits = this.find(FIND_EXIT);
  }

  return this._exits;
};

Room.prototype.getUniqueExitPoints = function getUniqueExitPoints() {
  if (!this._uniqueExitPoints) {
    const exitCoords = this.getExits();
    this._uniqueExitPoints = exitCoords.filter((coord, index) => {
      if (index === 0) {
        return true;
      }

      const prevCoord = exitCoords[index - 1];
      return !Math.abs(coord.x - prevCoord.x < 2) || !Math.abs(coord.y - prevCoord.y < 2);
    });
  }

  return this._uniqueExitPoints();
};

Room.prototype.hasOutdatedCreeps = function hasOutdatedCreeps() {
  return this.getOutdatedCreeps().length > 0;
};

Room.prototype.getOutdatedCreeps = function getOutdatedCreeps() {
  return this.myCreeps().filter((creep) => {
    return creep.cost() <= this.getSpawn().maxEnergy() - 100;
  });
};

Room.prototype.setupFlags = function setupFlags() {
  if (Game.time % 50) {
    this.createControllerEnergyDropFlag();
  }
};

Room.prototype.createSpawnEnergyDropFlag = function createSpawnEnergyDropFlag() {
  const spawn = this.getSpawn();
  this.createFlag(spawn.pos.x, spawn.pos.y - 1, 'SPAWN_ENERGY_DROP', COLOR_YELLOW);
};

Room.prototype.createControllerEnergyDropFlag = function createSpawnEnergyDropFlag() {
  const controller = this.controller;
  this.createFlag(controller.pos.x, controller.pos.y + 2, 'CONTROLLER_ENERGY_DROP', COLOR_YELLOW);
};

Room.prototype.getFlags = function getFlags() {
  return this.find(FIND_FLAGS).filter(flag => {
    return flag.room === this;
  });
};

Room.prototype.getControllerEnergyDropFlag = function getControllerEnergyDropFlag() {
  return this.getFlags().filter(flag => {
    return flag.name.indexOf('CONTROLLER_ENERGY_DROP') !== -1;
  })[0];
};

Room.prototype.workerCount = function workerCount() {
  return this.harvesterCount() + this.builderCount() + this.mailmanCount();
};

Room.prototype.courierCount = function courierCount() {
  return this.getCouriers().length;
};

Room.prototype.getCouriers = function getCouriers() {
  if (!this._couriers) {
    this._couriers = this.myCreeps().filter((creep) => {
      return creep.memory.role === 'courier';
    });
  }

  return this._couriers;
};

Room.prototype.myCreeps = function myCreeps() {
  if (!this._myCreeps) {
    this._myCreeps = this.find(FIND_MY_CREEPS);
  }

  return this._myCreeps;
};

Room.prototype.builderCount = function builderCount() {
  return this.getBuilders().length;
};

Room.prototype.getBuilders = function getBuilders() {
  if (!this._builders) {
    this._builders = this.myCreeps().filter((creep) => {
      return creep.memory.role === 'builder';
    });
  }

  return this._builders;
};

Room.prototype.upgraderCount = function upgraderCount() {
  return this.getUpgraders().length;
};

Room.prototype.getUpgraders = function getUpgraders() {
  if (!this._upgraders) {
    this._upgraders = this.myCreeps().filter(creep => {
      return creep.memory.role === 'upgrader';
    });
  }
  return this._upgraders;
};

Room.prototype.getConstructionSites = function getConstructionSites() {
  return this.find(FIND_CONSTRUCTION_SITES);
};

Room.prototype.getSources = function getSources() {
  if (!this._sources) {
    this._sources = this.find(FIND_SOURCES);
  }

  return this._sources;
};

Room.prototype.getSourcesNeedingHarvesters = function getSourcesNeedingHarvesters() {
  return this.getSources().filter(source => {
    return source.needsHarvesters();
  });
};

Room.prototype.needsHarvesters = function needsHarvesters() {
  return this.getSourcesNeedingHarvesters().length > 0;
};

Room.prototype.getEnergySourceStructures = function getEnergySourceStructures() {
  return this.getMyStructures().filter(structure => {
    return structure.energy;
  });
};

Room.prototype.droppedControllerEnergy = function droppedControllerEnergy() {
  if (!this._droppedControllerEnergy) {
    const dumpFlag = this.getControllerEnergyDropFlag();
    this._droppedControllerEnergy = this.find(FIND_DROPPED_ENERGY).filter(energy => {
      return energy.pos.getRangeTo(dumpFlag) === 0;
    })[0];
  }

  return this._droppedControllerEnergy;
};

Room.prototype.getEnergyStockSources = function getEnergyStockSources() {
  if (!this._energyStockSources) {
    const droppedControllerEnergy = this.droppedControllerEnergy();
    this._energyStockSources = this.getEnergySourceStructures();
    if (droppedControllerEnergy) {
      this._energyStockSources.unshift(droppedControllerEnergy);
    }
  }

  return this._energyStockSources;
};

Room.prototype.getSpawn = function getSpawn() {
  const spawns = this.find(FIND_MY_SPAWNS);
  if (spawns.length) {
    return spawns[0];
  }

  return spawns;
};

Room.prototype.canBuildExtension = function canBuildExtension() {
  if (this._canBuildExtensions === undefined) {
    const maxExtensions = settings.buildingCount[this.controller.level].extensions || 0;
    this._canBuildExtensions = this.getExtensions().length < maxExtensions;
  }
  return this._canBuildExtensions;
};

Room.prototype.getExtensions = function getExtensions() {
  if (!this._extensions) {
    this._extensions = this.getMyStructures().filter(structure => {
      return structure.structureType === STRUCTURE_EXTENSION;
    });
  }

  return this._extensions;
};

Room.prototype.courierTargets = function courierTargets() {
  return this.getCouriers().filter(creep => {
    return creep.memory.role === 'courier' && !!creep.memory.target;
  }).map(courier => {
    return courier.memory.target;
  });
};

Room.prototype.getCreepsThatNeedOffloading = function getCreepsThatNeedOffloading() {
  const targets = this.courierTargets();
  return this.getHarvesters().filter(harvester => {
    const targeted = targets.indexOf(harvester.id) !== -1;
    return harvester.needsOffloaded() && !targeted;
  });
};

Room.prototype.getDroppedEnergy = function getDroppedEnergy() {
  return this.find(FIND_DROPPED_ENERGY).sort((energyA, energyB) => {
    return energyB.energy - energyA.energy;
  });
};

Room.prototype.getEnergyThatNeedsPickedUp = function getEnergyThatNeedsPickedUp() {
  const targets = this.courierTargets();
  const dumpFlag = this.getControllerEnergyDropFlag();

  return this.getDroppedEnergy().filter(energy => {
    const targeted = targets.indexOf(energy.id) !== -1;
    return !targeted && energy.pos.getRangeTo(dumpFlag) !== 0;
  });
};

Room.prototype.getControllerOwned = function getControllerOwned() {
  return this.controller.my;
};

function getAllScouts() {
  return Object.keys(Game.creeps).filter(creepName => {
    const creep = Game.creeps[creepName];
    return creep.memory.role === 'scout';
  });
}

function getAllScoutHarvesters() {
  return Object.keys(Game.creeps).filter(creepName => {
    const creep = Game.creeps[creepName];
    return creep.memory.role === 'scoutharvester' || creep.memory.oldRole === 'scoutharvester';
  });
}

Room.prototype.getDismantleFlag = function getDismantleFlag() {
  return Game.dismantleFlags().filter((flag) => {
    return flag.room === this;
  })[0];
};

Room.prototype.getStructureAt = function getStructureAt(roomPosition) {
  return this.getStructures().filter((structure) => {
    return structure.pos.getRangeTo(roomPosition) === 0;
  })[0];
};

Room.prototype.hasScoutFlag = function hasScoutFlag() {
  return Game.getScoutFlags().filter((flag) => {
    return flag.room === this;
  }).length > 0;
};

Room.prototype.needsScouts = function needsScouts() {
  let desiredValue = 2;
  if (Game.dismantleFlags().length > 0) {
    desiredValue = 4;
  }
  return this.hasScoutFlag() && getAllScouts().length < desiredValue;
};

function getAllClaimers() {
  return Object.keys(Game.creeps).filter((creepName) => {
    const creep = Game.creeps[creepName];
    return creep.memory.role === 'claimer';
  });
}

Room.prototype.needsClaimers = function needsClaimers() {
  return this.hasScoutFlag() && Game.claimFlags().length > 0 && getAllClaimers().length < 1;
};

Room.prototype.needsScoutHarvesters = function needsScoutHarvesters() {
  let desiredValue = 2;
  if (Game.dismantleFlags().length > 0) {
    desiredValue = 0;
  }
  return this.hasScoutFlag() && getAllScoutHarvesters().length < desiredValue;
};

Room.prototype.getEnergySourcesThatNeedsStocked = function getEnergySourcesThatNeedsStocked() {
  if (this.getEnergyThatNeedsPickedUp().length) {
    return this.getEnergyThatNeedsPickedUp();
  } else if (this.getCreepsThatNeedOffloading().length) {
    return this.getCreepsThatNeedOffloading();
  } else if (this.getStorage() && !this.getStorage().isEmpty()) {
    return [this.getStorage()];
  }

  return [];
};
