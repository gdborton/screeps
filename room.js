var settings = require('settings');
var validExitCoord = require('valid-exit-coord');

Room.prototype.work = function() {
  this.getMyStructures().forEach(function(structure) {
    structure.work();
  });

  this.getCreeps().forEach(function(creep) {
    creep.work();
  });
};

Room.prototype.getCreeps = function() {
  return this.find(FIND_MY_CREEPS);
};

Room.prototype.getStructures = function() {
  return this.find(FIND_STRUCTURES);
};

Room.prototype.getMyStructures = function() {
  return this.find(FIND_MY_STRUCTURES);
};

Room.prototype.getHarvesters = function() {
  return this.find(FIND_MY_CREEPS, {filter: {memory: {role: 'harvester'}}});
};

Room.prototype.harvesterCount = function() {
  return this.getHarvesters().length;
};

Room.prototype.getMailmen = function() {
  return this.find(FIND_MY_CREEPS, {filter: {memory: {role: 'mailman'}}});
};

Room.prototype.mailmanCount = function() {
  return this.getMailmen().length;
};

Room.prototype.getExits = function() {
  return this.find(FIND_EXIT);
};

Room.prototype.getUniqueExitPoints = function() {
  var exitCoords = this.getExits();
  exitCoords = exitCoords.filter(function(coord, index) {
    if (index === 0) {
      return true;
    }

    var prevCoord = exitCoords[index - 1];

    return !Math.abs(coord.x - prevCoord.x < 2) || !Math.abs(coord.y - prevCoord.y < 2);
  });

  return exitCoords;
};

Room.prototype.hasOutdatedCreeps = function() {
  return this.getOutdatedCreeps().length > 0;
};

Room.prototype.getOutdatedCreeps = function() {
  var self = this;
  return this.find(FIND_MY_CREEPS).filter(function(creep) {
    return creep.cost() <= self.getSpawn().maxEnergy() - 100;
  });
};

Room.prototype.setupFlags = function() {
  this.createControllerEnergyDropFlag();
};

Room.prototype.createSpawnEnergyDropFlag = function() {
  var spawn = this.getSpawn();
  this.createFlag(spawn.pos.x, spawn.pos.y - 1, 'SPAWN_ENERGY_DROP', COLOR_YELLOW);
};

Room.prototype.createControllerEnergyDropFlag = function() {
  var controller = this.controller;
  this.createFlag(controller.pos.x, controller.pos.y + 2, 'CONTROLLER_ENERGY_DROP', COLOR_YELLOW);
};

Room.prototype.getControllerEnergyDropFlag = function() {
  return this.find(FIND_FLAGS, {filter: {name: 'CONTROLLER_ENERGY_DROP'}})[0];
};

Room.prototype.getSpawnEnergyDropFlag = function() {
  return this.find(FIND_FLAGS, {filter: {name: 'SPAWN_ENERGY_DROP'}})[0];
};

Room.prototype.workerCount = function() {
  return this.harvesterCount() + this.builderCount() + this.mailmanCount();
};

Room.prototype.courierCount = function() {
  return this.find(FIND_MY_CREEPS, {filter: {memory: {role: 'courier'}}}).length;
};

Room.prototype.builderCount = function() {
  return this.getBuilders().length;
};

Room.prototype.getBuilders = function () {
  return this.find(FIND_MY_CREEPS, {filter: {memory: {role: 'builder'}}});
};

Room.prototype.upgraderCount = function() {
  return this.getUpgraders().length;
};

Room.prototype.getUpgraders = function () {
  if (!this._upgraders) {
    this._upgraders = this.find(FIND_MY_CREEPS, {filter: {memory: {role: 'upgrader'}}});
  }
  return this._upgraders;
};

Room.prototype.getConstructionSites = function() {
  return this.find(FIND_CONSTRUCTION_SITES);
};

Room.prototype.needsHarvesters = function() {
  return this.find(FIND_SOURCES).filter(function(source) {
    return source.needsHarvesters();
  }).length > 0;
};

Room.prototype.getEnergySourceStructures = function() {
  return this.find(FIND_MY_STRUCTURES).filter(function(structure) {
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
  var maxExtensions = settings.buildingCount[this.controller.level].extensions || 0;
  return this.getExtensions().length < maxExtensions;
};

Room.prototype.getExtensions = function() {
  return this.find(FIND_MY_STRUCTURES).filter(function(structure) {
    return structure.structureType === STRUCTURE_EXTENSION;
  });
};

Room.prototype.courierTargets = function() {
  return this.find(FIND_MY_CREEPS).filter(function(creep) {
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
  return this.find(FIND_DROPPED_ENERGY);
};

Room.prototype.getEnergyThatNeedsPickedUp = function() {
  var targets = this.courierTargets();
  var dumpFlag = this.getControllerEnergyDropFlag();

  return this.getDroppedEnergy().filter(function(energy) {
    var targeted = targets.indexOf(energy.id) !== -1;
    return !targeted && energy.pos.getRangeTo(dumpFlag) !== 0;
  }).sort(function(energyA, energyB) {
    return energyA.enery - energyB.energy;
  });
};

Room.prototype.getEnergySourcesThatNeedsStocked = function() {
  var targets = this.courierTargets();

  var potentialTargets = this.getEnergyThatNeedsPickedUp();

  if (!potentialTargets.length) {
    return this.getCreepsThatNeedOffloading();
  }

  return potentialTargets;
};
