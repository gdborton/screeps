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

Spawn.prototype.work = function() {
  var harvesterCount = this.room.find(FIND_MY_CREEPS, {filter: { memory: {role: 'harvester'}}}).length;
  var defenderCount = this.room.find(FIND_MY_CREEPS, {filter: { memory: {role: 'defender'}}}).length;
  var healerCount = this.room.find(FIND_MY_CREEPS, {filter: { memory: {role: 'healer'}}}).length;

  if (harvesterCount < 2) {
    this.buildHarvester();
  } else if (harvesterCount / defenderCount > 3) {
    this.buildDefender();
  } else if (healerCount < 2) {
    this.buildHealer();
  } else {
    this.buildHarvester();
  }
};

Spawn.prototype.buildDefender = function() {
  this.createCreep([MOVE, ATTACK, ATTACK, ATTACK], undefined, {role: 'defender'});
};

Spawn.prototype.buildHealer = function() {
  this.createCreep([MOVE, HEAL], undefined, {role: 'healer'});
};
