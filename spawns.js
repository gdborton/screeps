require('source');
var settings = require('settings');

Spawn.prototype.buildHarvester = function() {
  var closestSource = this.pos.findClosestByPath(FIND_SOURCES);
  var sourceId;
  if (closestSource && closestSource.needsHarvesters()) {
    sourceId = closestSource.id;
  } else {
    this.room.find(FIND_SOURCES).forEach(function(source) {
      if (!sourceId && source.needsHarvesters()) {
        sourceId = source.id;
      }
    });
  }

  if (sourceId) {
    this.createCreep([MOVE, WORK, CARRY], undefined, {role: 'harvester', source: sourceId});
  }
};

Spawn.prototype.buildCourier = function() {
  this.createCreep([MOVE, MOVE, MOVE, CARRY, CARRY, CARRY], undefined, {role: 'courier'});
};

Spawn.prototype.work = function() {
  if (this.energy === this.energyCapacity) {
    var harvesterCount = this.room.harvesterCount();
    var workerCount = this.room.workerCount();
    var courierCount = this.room.courierCount();

    if (harvesterCount < 1) {
      this.buildHarvester();
    } else if (settings.courierToWorkerRatio < courierCount / workerCount) {
      this.buildCourier();
    } else {
      this.buildHarvester();
    }
  }
};

Spawn.prototype.buildDefender = function() {
  this.createCreep([TOUGH, TOUGH, TOUGH, TOUGH, MOVE, ATTACK, MOVE, ATTACK], undefined, {role: 'defender'});
};

Spawn.prototype.buildHealer = function() {
  this.createCreep([MOVE, HEAL], undefined, {role: 'healer'});
};
