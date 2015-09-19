Room.prototype.getHarvesters = function() {
  return this.find(FIND_MY_CREEPS, {filter: {memory: {role: 'harvester'}}});
};

Room.prototype.harvesterCount = function() {
  return this.find(FIND_MY_CREEPS, {filter: {memory: {role: 'harvester'}}}).length;
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

Room.prototype.needsHarvesters = function() {
  return this.find(FIND_SOURCES).filter(function(source) {
    return source.needsHarvesters();
  }).length > 0;
};
