import settings from './settings';
import validExitCoord from './valid-exit-coord';

Room.prototype.work = function() {
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

Room.prototype.hasHostileCreeps = function() {
  return this.getHostileCreeps().length > 0;
};

Room.prototype.getHostileCreeps = function() {
  return this.find(FIND_HOSTILE_CREEPS);
};

Room.prototype.needsUpgraders = function() {
  return this.upgraderCount() < this.controller.pos.freeEdges() && !!this.droppedControllerEnergy() && this.upgraderWorkParts() < this.maxEnergyProducedPerTick();
};

Room.prototype.needsBuilders = function() {
  this.damagedBuildings();
  return this.builderCount() < 1  && (this.getConstructionSites().length > 0 || this.damagedBuildings().length > 0);
};

Room.prototype.damagedBuildings = function() {
  return this.getStructures().filter(function(structure) {
    return structure.structureType !== STRUCTURE_ROAD && structure.needsRepaired();
  });
};

Room.prototype.getStorage = function() {
  if (!this._storageCalc) {
    this._storageCalc = true;
    this._storage = this.getMyStructures().filter(function (structure) {
      return structure.structureType === STRUCTURE_STORAGE;
    })[0];
  }
  return this._storage;
};

Room.prototype.getLinks = function() {
  if (!this._links) {
    this._links = this.getMyStructures().filter(function(structure) {
      return structure.structureType === STRUCTURE_LINK;
    });
  }

  return this._links;
};

Room.prototype.getControllerLink = function() {
  return this.getLinks().filter(function(link) {
    return link.isControllerLink();
  })[0];
};

Room.prototype.upgraderWorkParts = function() {
  if (!this._upgraderWorkParts) {
    var upgraderWorkParts = this.getUpgraders();
    upgraderWorkParts = upgraderWorkParts.map(function(upgrader) {
      return upgrader.body.filter(function(bodyPart) {
        return bodyPart.type === WORK;
      }).length;
    });

    if (upgraderWorkParts.length) {
      this._upgraderWorkParts = upgraderWorkParts.reduce(function(a, b) { return a + b; });
    } else {
      this._upgraderWorkParts = 0;
    }
  }

  return this._upgraderWorkParts;
};

Room.prototype.maxEnergyProducedPerTick = function() {
  return this.sourceCount() * 10;
};

Room.prototype.sourceCount = function() {
  return this.getSources().length;
};

Room.prototype.getStructures = function() {
  if (!this._structures) {
    this._structures = this.find(FIND_STRUCTURES);
  }
  return this._structures;
};

Room.prototype.getRoads = function() {
  if (!this._roads) {
    this._roads = this.getStructures().filter(function(structure) {
      return structure.structureType === STRUCTURE_ROAD;
    });
  }

  return this._roads;
};

Room.prototype.getDamagedRoads = function() {
  if (!this._damagedRoads) {
    this._damagedRoads = this.getRoads().filter(function(road) {
      return road.structureType === STRUCTURE_ROAD && road.hits / road.hitsMax < 0.5;
    });
  }

  return this._damagedRoads;
};

Room.prototype.hasDamagedRoads = function() {
  return this.getDamagedRoads().length > 0;
};

Room.prototype.needsRoadWorkers = function() {
  if (Game.time % 30 !== 0) {
    return false;
  }

  return this.roadWorkerCount() < 1 && this.hasDamagedRoads();
};

Room.prototype.needsCouriers = function() {
  if (this.courierCount() === 1 && this.getCouriers()[0].ticksToLive < 70) {
    return true;
  }

  var storage = this.getStorage();
  if (!storage) {
    return this.courierCount() < 2;
  } else if (storage.store.energy > 500000) {
    return this.courierCount() < Math.floor(storage.store.energy / 200000);
  }

  return this.courierCount() < 1;
};

Room.prototype.getMyStructures = function() {
  if (!this._myStructures) {
    this._myStructures = this.find(FIND_MY_STRUCTURES);
  }

  return this._myStructures;
};

Room.prototype.getHarvesters = function() {
  if (!this._harvesters) {
    this._harvesters = this.myCreeps().filter((creep) => {
      return creep.memory.role === 'harvester';
    });
  }
  return this._harvesters;
};

Room.prototype.getRoadWorkers = function() {
  if (!this._roadWorkers) {
    this._roadWorkers = this.myCreeps().filter((creep) => {
      return creep.memory.role === 'roadworker';
    });
  }

  return this._roadWorkers;
};

Room.prototype.roadWorkerCount = function() {
  return this.getRoadWorkers().length;
};

Room.prototype.harvesterCount = function() {
  return this.getHarvesters().length;
};

Room.prototype.getMailmen = function() {
  if (!this._mailmen) {
    this._mailmen = this.myCreeps().filter((creep) => {
      return creep.memory.role === 'mailman';
    });
  }

  return this._mailmen;
};

Room.prototype.mailmanCount = function() {
  return this.getMailmen().length;
};

Room.prototype.getExits = function() {
  if (!this._exits) {
    this._exits = this.find(FIND_EXIT);
  }

  return this._exits;
};

Room.prototype.getUniqueExitPoints = function() {
  if (!this._uniqueExitPoints) {
    var exitCoords = this.getExits();
    this._uniqueExitPoints = exitCoords.filter(function(coord, index) {
      if (index === 0) {
        return true;
      }

      var prevCoord = exitCoords[index - 1];

      return !Math.abs(coord.x - prevCoord.x < 2) || !Math.abs(coord.y - prevCoord.y < 2);
    });
  }

  return this._uniqueExitPoints();
};

Room.prototype.hasOutdatedCreeps = function() {
  return this.getOutdatedCreeps().length > 0;
};

Room.prototype.getOutdatedCreeps = function() {
  var self = this;
  return this.myCreeps().filter(function(creep) {
    return creep.cost() <= self.getSpawn().maxEnergy() - 100;
  });
};

Room.prototype.setupFlags = function() {
  if (Game.time % 50) {
    this.createControllerEnergyDropFlag();
  }
};

Room.prototype.createSpawnEnergyDropFlag = function() {
  var spawn = this.getSpawn();
  this.createFlag(spawn.pos.x, spawn.pos.y - 1, 'SPAWN_ENERGY_DROP', COLOR_YELLOW);
};

Room.prototype.createControllerEnergyDropFlag = function() {
  var controller = this.controller;
  this.createFlag(controller.pos.x, controller.pos.y + 2, 'CONTROLLER_ENERGY_DROP', COLOR_YELLOW);
};

Room.prototype.getFlags = function() {
  return this.find(FIND_FLAGS).filter((flag) => {
    return flag.room === this;
  });
};

Room.prototype.getControllerEnergyDropFlag = function() {
  return this.getFlags().filter(function(flag) {
    return flag.name.indexOf('CONTROLLER_ENERGY_DROP') !== -1;
  })[0];
};

Room.prototype.workerCount = function() {
  return this.harvesterCount() + this.builderCount() + this.mailmanCount();
};

Room.prototype.courierCount = function() {
  return this.getCouriers().length;
};

Room.prototype.getCouriers = function() {
  if (!this._couriers) {
    this._couriers = this.myCreeps().filter((creep) => {
      return creep.memory.role === 'courier';
    });
  }

  return this._couriers;
};

Room.prototype.myCreeps = function() {
  if (!this._myCreeps) {
    this._myCreeps = this.find(FIND_MY_CREEPS);
  }

  return this._myCreeps;
};

Room.prototype.builderCount = function() {
  return this.getBuilders().length;
};

Room.prototype.getBuilders = function () {
  if (!this._builders) {
    this._builders = this.myCreeps().filter((creep) => {
      return creep.memory.role === 'builder';
    });
  }

  return this._builders;
};

Room.prototype.upgraderCount = function() {
  return this.getUpgraders().length;
};

Room.prototype.getUpgraders = function () {
  if (!this._upgraders) {
    this._upgraders = this.myCreeps().filter((creep)=> {
      return creep.memory.role === 'upgrader';
    });
  }
  return this._upgraders;
};

Room.prototype.getConstructionSites = function() {
  return this.find(FIND_CONSTRUCTION_SITES);
};

Room.prototype.getSources = function() {
  if (!this._sources) {
    this._sources = this.find(FIND_SOURCES);
  }

  return this._sources;
};

Room.prototype.getSourcesNeedingHarvesters = function() {
  return this.getSources().filter(function(source) {
    return source.needsHarvesters();
  });
};

Room.prototype.needsHarvesters = function() {
  return this.getSourcesNeedingHarvesters().length > 0;
};

Room.prototype.getEnergySourceStructures = function() {
  return this.getMyStructures().filter(function(structure) {
    return structure.energy;
  });
};

Room.prototype.droppedControllerEnergy = function() {
  if (!this._droppedControllerEnergy) {
    var dumpFlag = this.getControllerEnergyDropFlag();
    this._droppedControllerEnergy = this.find(FIND_DROPPED_ENERGY).filter(function(energy) {
      return energy.pos.getRangeTo(dumpFlag) === 0;
    })[0];
  }

  return this._droppedControllerEnergy;
};

Room.prototype.getEnergyStockSources = function() {
  if (!this._energyStockSources) {
    var droppedControllerEnergy = this.droppedControllerEnergy();
    this._energyStockSources = this.getEnergySourceStructures();
    if (droppedControllerEnergy) {
      this._energyStockSources.unshift(droppedControllerEnergy);
    }
  }

  return this._energyStockSources;
};

Room.prototype.getSpawn = function() {
  var spawns = this.find(FIND_MY_SPAWNS);
  if (spawns.length) {
    return spawns[0];
  }

  return spawns;
};

Room.prototype.canBuildExtension = function() {
  if (this._canBuildExtensions === undefined) {
    var maxExtensions = settings.buildingCount[this.controller.level].extensions || 0;
    this._canBuildExtensions = this.getExtensions().length < maxExtensions;
  }
  return this._canBuildExtensions;
};

Room.prototype.getExtensions = function() {
  if (!this._extensions) {
    this._extensions = this.getMyStructures().filter(function(structure) {
      return structure.structureType === STRUCTURE_EXTENSION;
    });
  }

  return this._extensions;
};

Room.prototype.courierTargets = function() {
  return this.getCouriers().filter(function(creep) {
    return creep.memory.role === 'courier' && !!creep.memory.target;
  }).map(function(courier) {
    return courier.memory.target;
  });
};

Room.prototype.getCreepsThatNeedOffloading = function() {
  var targets = this.courierTargets();
  return this.getHarvesters().filter(function(harvester) {
    var targeted = targets.indexOf(harvester.id) !== -1;
    return harvester.needsOffloaded() && !targeted;
  });
};

Room.prototype.getDroppedEnergy = function() {
  return this.find(FIND_DROPPED_ENERGY).sort((energyA, energyB) => {
    return energyB.energy - energyA.energy;
  });
};

Room.prototype.getEnergyThatNeedsPickedUp = function() {
  var targets = this.courierTargets();
  var dumpFlag = this.getControllerEnergyDropFlag();

  return this.getDroppedEnergy().filter(function(energy) {
    var targeted = targets.indexOf(energy.id) !== -1;
    return !targeted && energy.pos.getRangeTo(dumpFlag) !== 0;
  });
};

Room.prototype.getControllerOwned = function() {
  return this.controller.my;
};

function getAllScouts() {
  return Object.keys(Game.creeps).filter(function(creepName) {
    var creep = Game.creeps[creepName];
    return creep.memory.role === 'scout';
  });
}

function getAllScoutHarvesters() {
  return Object.keys(Game.creeps).filter(function(creepName) {
    var creep = Game.creeps[creepName];
    return creep.memory.role === 'scoutharvester' || creep.memory.oldRole === 'scoutharvester';
  });
}

Room.prototype.getDismantleFlag = function() {
  return Game.dismantleFlags().filter((flag) => {
    return flag.room === this;
  })[0];
};

Room.prototype.getStructureAt = function(roomPosition) {
  return this.getStructures().filter((structure) => {
    return structure.pos.getRangeTo(roomPosition) === 0;
  })[0];
};

Room.prototype.hasScoutFlag = function() {
  return Game.getScoutFlags().filter((flag) => {
    return flag.room === this;
  }).length > 0;
};

Room.prototype.needsScouts = function() {
  var desiredValue = 2;
  if (Game.dismantleFlags().length > 0) {
    desiredValue = 4;
  }
  return this.hasScoutFlag() && getAllScouts().length < desiredValue;
};

function getAllClaimers() {
  return Object.keys(Game.creeps).filter((creepName) => {
    var creep = Game.creeps[creepName];
    return creep.memory.role === 'claimer';
  });
};

Room.prototype.needsClaimers = function() {
  return this.hasScoutFlag() && Game.claimFlags().length > 0 && getAllClaimers().length < 1;
};

Room.prototype.needsScoutHarvesters = function() {
  var desiredValue = 2;
  if (Game.dismantleFlags().length > 0) {
    desiredValue = 0;
  }
  return this.hasScoutFlag() && getAllScoutHarvesters().length < desiredValue;
};

Room.prototype.getEnergySourcesThatNeedsStocked = function() {
  if (this.getEnergyThatNeedsPickedUp().length) {
    return this.getEnergyThatNeedsPickedUp();
  } else if (this.getCreepsThatNeedOffloading().length) {
    return this.getCreepsThatNeedOffloading();
  } else if (this.getStorage() && !this.getStorage().isEmpty()) {
    return [this.getStorage()];
  }

  return [];
};
