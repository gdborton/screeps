Room.prototype.getHarvesters = function() {
  return this.find(FIND_MY_CREEPS, {filter: {memory: {role: 'harvester'}}});
};
