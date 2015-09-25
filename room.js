var settings = require('settings');

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

Room.prototype.setupFlags = function() {
  this.createSpawnEnergyDropFlag();
};

Room.prototype.createSpawnEnergyDropFlag = function() {
  var spawn = this.getSpawn();
  this.createFlag(spawn.pos.x, spawn.pos.y - 1, 'SPAWN_ENERGY_DROP', COLOR_YELLOW);
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
  return this.find(FIND_MY_CREEPS, {filter: {memory: {role: 'builder'}}}).length;
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
    return creep.memory.roll === 'courier' && !!creep.memory.target;
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
  var dumpFlag = this.getSpawnEnergyDropFlag();

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
