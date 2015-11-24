
// Finds and returns the number of open spots next to the source.
Source.prototype.freeEdges = function() {
  return this.pos.freeEdges();
};

Source.prototype.needsHarvesters = function() {
  var harvesters = this.room.find(FIND_MY_CREEPS, {filter: {memory: {role: 'harvester', source: this.id }}});
  var workParts = 0;
  harvesters.forEach(function(harvester) {
    workParts = workParts + harvester.body.filter(function(bodyPart) {
      return bodyPart.type === 'work';
    }).length;
  });

  return workParts < 5 && harvesters.length < this.freeEdges();
};
