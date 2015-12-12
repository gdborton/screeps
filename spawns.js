require('source');
require('room');
var settings = require('settings');
var bodyCosts = require('body-costs');

Spawn.prototype.buildHarvester = function() {
  var sources = this.room.getSourcesNeedingHarvesters();
  var closestSource = this.pos.findClosestByRange(sources);

  if (closestSource) {
    var sourceId = closestSource.id;
    var body = [MOVE, WORK, WORK, CARRY];
    var cost = bodyCosts.calculateCosts(body);
    var forcedReturn = false;
    while (cost <= this.availableEnergy() && !forcedReturn) {
      if (body.filter(function(part) { return part === WORK }).length < 5) {
        body.push(WORK);
      } else if(body.filter(function(part) { return part === CARRY }).length < 10) {
        body.push(CARRY);
      } else {
        body.push(WORK, WORK, WORK, WORK);
        forcedReturn = true;
      }
      cost = bodyCosts.calculateCosts(body);
    }

    while(cost > this.availableEnergy()) {
      body.pop();
      cost = bodyCosts.calculateCosts(body);
    }
    this.createCreep(body, undefined, {role: 'harvester', source: sourceId});
  }
};

Spawn.prototype.buildScout = function() {
  var body = [ATTACK, MOVE, CARRY, WORK];
  while (cost < this.availableEnergy()) {
    body.push(MOVE, CARRY);
  }
  while(cost > this.availableEnergy()) {
    body.pop();
    cost = bodyCosts.calculateCosts();
  }
  this.createCreep(body, undefined, {role: 'scout'});
};

Spawn.prototype.buildMailman = function() {
  var body = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY];
  var cost = bodyCosts.calculateCosts(body);
  while (cost < this.availableEnergy()) {
    body.push(MOVE);
    body.push(CARRY);
    cost = bodyCosts.calculateCosts(body);
  }

  while(cost > this.availableEnergy()) {
    body.pop();
    cost = bodyCosts.calculateCosts(body);
  }

  this.createCreep(body, undefined, {role: 'mailman'});
};

Spawn.prototype.buildCourier = function() {
  var body = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY];
  var cost = bodyCosts.calculateCosts(body);
  while (cost < this.availableEnergy()) {
    body.push(MOVE);
    body.push(CARRY);
    cost = bodyCosts.calculateCosts(body);
  }

  while (cost > this.availableEnergy()) {
    body.pop();
    cost = bodyCosts.calculateCosts(body);
  }

  this.createCreep(body, undefined, {role: 'courier'});
};

Spawn.prototype.buildRoadWorker = function() {
  var body = [MOVE, WORK, WORK, CARRY];
  this.createCreep(body, undefined, {role: 'roadworker'})
};

Spawn.prototype.buildBuilder = function() {
  var body = [MOVE, MOVE, WORK, CARRY];
  var cost = bodyCosts.calculateCosts(body);

  while (cost < this.availableEnergy()) {
    body.push(MOVE);
    body.push(CARRY);
    body.push(WORK);
    cost = bodyCosts.calculateCosts(body);
  }

  while (cost > this.availableEnergy()) {
    body.pop();
    cost = bodyCosts.calculateCosts(body);
  }
  this.createCreep(body, undefined, {role: 'builder'});
};

Spawn.prototype.buildDefender = function() {
  this.createCreep([TOUGH, TOUGH, TOUGH, TOUGH, MOVE, ATTACK, MOVE, ATTACK], undefined, {role: 'defender'});
};

Spawn.prototype.buildHealer = function() {
  this.createCreep([MOVE, HEAL], undefined, {role: 'healer'});
};

Spawn.prototype.buildUpgrader = function() {
  var body = [MOVE, WORK, WORK, CARRY];
  var workParts = 2;
  var cost = bodyCosts.calculateCosts(body);
  var workPartsNeeded = this.room.maxEnergyProducedPerTick() - this.room.upgraderWorkParts();
  if (this.room.controller.pos.freeEdges() > 1) {
    workPartsNeeded = Math.min(workPartsNeeded, this.room.maxEnergyProducedPerTick() / 2);
  }
  while (cost < this.availableEnergy() && workParts < workPartsNeeded) {
    body.push(WORK);
    workParts++;
    cost = bodyCosts.calculateCosts(body);
  }

  while (cost > this.availableEnergy()) {
    body.pop();
    cost = bodyCosts.calculateCosts(body);
  }

  this.createCreep(body, undefined, {role: 'upgrader'});
};

Spawn.prototype.work = function() {
  var harvesterCount = this.room.harvesterCount();
  var courierCount = this.room.courierCount();

  if (this.availableEnergy() >= 300 && harvesterCount < 1) {
    this.buildHarvester();
  } else if (this.availableEnergy() >= 300 && courierCount < 1) {
    this.buildCourier();
  } else if(this.availableEnergy() >= 300 && this.room.hasDamagedRoads() && this.room.roadWorkerCount() < 1) {
    this.buildRoadWorker();
  } else if (this.availableEnergy() === this.maxEnergy()) {
    var builderCount = this.room.builderCount();
    var workerCount = this.room.workerCount();
    var mailmanCount = this.room.mailmanCount();
    var upgraderCount = this.room.upgraderCount();

    if (settings.courierToWorkerRatio > courierCount / workerCount) {
      this.buildCourier();
    } else if (this.room.needsHarvesters()) {
      this.buildHarvester();
    } else if (this.room.needsUpgraders()) {
      this.buildUpgrader();
    } else if (mailmanCount < 2 && this.maxEnergy() < 600) {
      this.buildMailman();
    //} else if (this.room.hasOutdatedCreeps()) {
      //this.retireOldCreep();
    } else if (this.room.needsBuilders()) {
      this.buildBuilder();
    } else {
      this.extend();
    }
  } else {
    this.extend();
  }

  this.room.setupFlags();
};

Spawn.prototype.retireOldCreep = function() {
  var self = this;
  var outdatedCreeps = this.room.getOutdatedCreeps();

  if (outdatedCreeps.length) {
    outdatedCreeps[0].suicide();
  }
};

Spawn.prototype.maxEnergy = function() {
  var extensions = this.room.getExtensions();
  return this.energyCapacity + (extensions.length * (extensions.length ? extensions[0].energyCapacity : 0));
};

Spawn.prototype.availableEnergy = function() {
  var extensions = this.room.getExtensions();
  var availableEnergy = this.energy;
  extensions.forEach(function(extension) {
    availableEnergy += extension.energy;
  });
  return availableEnergy;
};

Spawn.prototype.extend = function() {
  if (this.room.canBuildExtension()) {
    this.room.createConstructionSite(this.pos.x - 1, this.pos.y - 1, STRUCTURE_EXTENSION);
  }
};
