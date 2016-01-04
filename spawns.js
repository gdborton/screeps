require('source');
require('room');
var settings = require('settings');
var bodyCosts = require('body-costs');

Spawn.prototype.buildHarvester = function(availableEnergy) {
  var sources = this.room.getSourcesNeedingHarvesters();
  var closestSource = this.pos.findClosestByRange(sources);

  if (closestSource) {
    var sourceId = closestSource.id;
    var body = [MOVE, WORK, WORK, CARRY];
    var cost = bodyCosts.calculateCosts(body);
    var forcedReturn = false;
    while (cost <= availableEnergy && !forcedReturn) {
      if (body.filter(function(part) { return part === WORK; }).length < 5) {
        body.push(WORK);
      } else if(body.filter(function(part) { return part === CARRY; }).length < 10) {
        body.push(CARRY);
      } else {
        body.push(WORK);
        forcedReturn = true;
      }
      cost = bodyCosts.calculateCosts(body);
    }

    while (cost > availableEnergy) {
      body.pop();
      cost = bodyCosts.calculateCosts(body);
    }
    this.createCreep(body, undefined, {role: 'harvester', source: sourceId});
  }
};

Spawn.prototype.buildScout = function (availableEnergy) {
  var body = [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK];
  var cost = bodyCosts.calculateCosts(body);
  while (cost < availableEnergy) {
    body.push(MOVE, CARRY);
    cost = bodyCosts.calculateCosts(body);
  }
  while(cost > availableEnergy) {
    body.pop();
    body.pop();
    cost = bodyCosts.calculateCosts(body);
  }
  this.createCreep(body, undefined, {role: 'scout'});
};

Spawn.prototype.buildScoutHarvester = function(availableEnergy) {
  var body = [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK];
  this.createCreep(body, undefined, {role: 'scoutharvester'});
};

Spawn.prototype.buildMailman = function(availableEnergy) {
  var body = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY];
  var cost = bodyCosts.calculateCosts(body);
  while (cost < availableEnergy) {
    body.push(MOVE);
    body.push(CARRY);
    cost = bodyCosts.calculateCosts(body);
  }

  while(cost > availableEnergy) {
    body.pop();
    cost = bodyCosts.calculateCosts(body);
  }

  this.createCreep(body, undefined, {role: 'mailman'});
};

Spawn.prototype.buildCourier = function(availableEnergy) {
  var body = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY];
  var cost = bodyCosts.calculateCosts(body);
  var maxCarryParts = this.room.getStorage() ? 10 : 100;
  var carryParts = 3;
  while (cost < availableEnergy && carryParts < maxCarryParts) {
    body.push(MOVE);
    body.push(CARRY);
    carryParts++;
    cost = bodyCosts.calculateCosts(body);
  }

  while (cost > availableEnergy) {
    body.pop();
    cost = bodyCosts.calculateCosts(body);
  }

  this.createCreep(body, undefined, {role: 'courier'});
};

Spawn.prototype.buildRoadWorker = function(availableEnergy) {
  var body = [MOVE, WORK, WORK, CARRY];
  this.createCreep(body, undefined, {role: 'roadworker'});
};

Spawn.prototype.buildBuilder = function(availableEnergy) {
  var body = [MOVE, MOVE, WORK, CARRY];
  var cost = bodyCosts.calculateCosts(body);

  while (cost < availableEnergy) {
    body.push(MOVE);
    body.push(CARRY);
    body.push(WORK);
    cost = bodyCosts.calculateCosts(body);
  }

  while (cost > availableEnergy || body.length > 50) {
    body.pop();
    cost = bodyCosts.calculateCosts(body);
  }
  this.createCreep(body, undefined, {role: 'builder'});
};

Spawn.prototype.buildDefender = function(availableEnergy) {
  this.createCreep([TOUGH, TOUGH, TOUGH, TOUGH, MOVE, ATTACK, MOVE, ATTACK], undefined, {role: 'defender'});
};

Spawn.prototype.buildHealer = function(availableEnergy) {
  this.createCreep([MOVE, HEAL], undefined, {role: 'healer'});
};

Spawn.prototype.buildUpgrader = function(availableEnergy) {
  var body = [MOVE, WORK, WORK, CARRY];
  var workParts = 2;
  var cost = bodyCosts.calculateCosts(body);
  var workPartsNeeded = this.room.maxEnergyProducedPerTick() - this.room.upgraderWorkParts();
  if (this.room.controller.pos.freeEdges() > 1) {
    workPartsNeeded = Math.min(workPartsNeeded, this.room.maxEnergyProducedPerTick() / 2);
  }
  while (cost < availableEnergy && workParts < workPartsNeeded) {
    body.push(WORK);
    workParts++;
    cost = bodyCosts.calculateCosts(body);
  }

  while (cost > availableEnergy) {
    body.pop();
    cost = bodyCosts.calculateCosts(body);
  }

  this.createCreep(body, undefined, {role: 'upgrader'});
};

Spawn.prototype.work = function() {
  if (this.spawning) {
    return;
  }
  var harvesterCount = this.room.harvesterCount();
  var availableEnergy = this.availableEnergy();
  if (availableEnergy >= 300 && availableEnergy < this.maxEnergy()) {
    if (harvesterCount < 1) {
      this.buildHarvester(availableEnergy);
    } else if (this.room.needsCouriers()) {
      this.buildCourier(availableEnergy);
    } else if (this.room.needsRoadWorkers()) {
      this.buildRoadWorker(availableEnergy);
    }
  } else if (availableEnergy === this.maxEnergy()) {
    if (this.room.needsCouriers()) {
      this.buildCourier(availableEnergy);
    } else if (this.room.needsHarvesters()) {
      this.buildHarvester(availableEnergy);
    } else if (this.room.needsUpgraders()) {
      this.buildUpgrader(availableEnergy);
    } else if (this.room.mailmanCount() < 2 && this.maxEnergy() < 600) {
      this.buildMailman(availableEnergy);
    } else if (this.room.needsBuilders()) {
      this.buildBuilder(availableEnergy);
    // } else if (this.room.needsScouts()) {
    //   this.buildScout(availableEnergy);
    // } else if (this.room.needsScoutHarvesters()) {
    //   this.buildScoutHarvester(availableEnergy);
    } else {
      this.extend();
    }
  } else {
    this.extend();
  }

  this.room.setupFlags();
};

Spawn.prototype.maxEnergy = function() {
  var extensions = this.room.getExtensions();
  return this.energyCapacity + (extensions.length * (extensions.length ? extensions[0].energyCapacity : 0));
};

Spawn.prototype.availableEnergy = function() {
  if (!this._availableEnergy) {
    var extensions = this.room.getExtensions();
    this._availableEnergy = this.energy;
    extensions.forEach((extension) => {
      this._availableEnergy += extension.energy;
    });
  }

  return this._availableEnergy;
};

Spawn.prototype.extend = function() {
  if (this.room.canBuildExtension()) {
    this.room.createConstructionSite(this.pos.x - 1, this.pos.y - 1, STRUCTURE_EXTENSION);
  }
};
