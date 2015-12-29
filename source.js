
// Finds and returns the number of open spots next to the source.
Source.prototype.freeEdges = function() {
  return this.pos.freeEdges();
};

Source.prototype.needsHarvesters = function() {
  var harvesters = this.room.getHarvesters();
  var workParts = 0;
  harvesters.forEach((harvester) => {
    if (harvester.memory.source === this.id) {
      workParts = workParts + harvester.body.filter((bodyPart) => {
        return bodyPart.type === 'work';
      }).length;
    }
  });

  return workParts < 5 && harvesters.length < this.freeEdges();
};
