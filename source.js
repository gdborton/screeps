
// Finds and returns the number of open spots next to the source.
Source.prototype.freeEdges = function() {
  if (!(Memory.sources && Memory.sources[this.id])) {
    var openSpots = 0;
    var surroundings = this.room.lookAtArea(this.pos.y - 1, this.pos.x - 1, this.pos.y + 1, this.pos.x + 1);
    Object.keys(surroundings).forEach(function(x) {
      Object.keys(surroundings[x]).forEach(function(y) {
        openSpots = openSpots + surroundings[x][y].filter(function(object) {
          return object.type === 'terrain' && (object.terrain === 'swamp' || object.terrain === 'plain');
        }).length
      });
    });

    Memory.sources = Memory.sources || {};
    Memory.sources[this.id] = openSpots;
  }

  return Memory.sources[this.id];
};

Source.prototype.needsHarvesters = function() {
  var harvesters = this.room.find(FIND_MY_CREEPS, {filter: {memory: {role: 'harvester', source: this.id }}});
  var workParts = 0;
  harvesters.forEach(function(harvester) {
    workParts = workParts + harvester.body.filter(function(bodyPart) {return bodyPart.type === 'work'}).length
  });

  return workParts < 5 && harvesters.length < this.freeEdges();
}
