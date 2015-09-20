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

Room.prototype.workerCount = function() {
  return this.harvesterCount();
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
    var targeted = targets.indexOf(harvester.name) !== -1;
    return harvester.needsOffloaded() && !targeted;
  });
};
