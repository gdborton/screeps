require('source');

Spawn.prototype.buildHarvester = function() {
  var closestSource = this.pos.findClosest(FIND_SOURCES);
  var sourceId;
  if (closestSource.needsHarvesters()) {
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
    var harvesterCount = this.room.find(FIND_MY_CREEPS, {filter: { memory: {role: 'harvester'}}}).length;
    var defenderCount = this.room.find(FIND_MY_CREEPS, {filter: { memory: {role: 'defender'}}}).length;
    var healerCount = this.room.find(FIND_MY_CREEPS, {filter: { memory: {role: 'healer'}}}).length;
    var courierCount = this.room.find(FIND_MY_CREEPS, {filter: { memory: {role: 'courier'}}}).length;

    if (harvesterCount < 2) {
      this.buildHarvester();
    } else if (courierCount < 1) {
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
