RoomPosition.prototype.identifier = function() {
  return this.roomName + 'x' + this.x + 'y' + this.y;
};

RoomPosition.prototype.freeEdges = function() {
  if (!(Memory.freeEdges && Memory.freeEdges[this.identifier()])) {
    var openSpots = 0;
    var surroundings = Game.rooms[this.roomName].lookAtArea(this.y - 1, this.x - 1, this.y + 1, this.x + 1);
    Object.keys(surroundings).forEach(function(x) {
      Object.keys(surroundings[x]).forEach(function(y) {
        openSpots = openSpots + surroundings[x][y].filter(function(object) {
          return object.type === 'terrain' && (object.terrain === 'swamp' || object.terrain === 'plain');
        }).length;
      });
    });

    Memory.freeEdges = Memory.freeEdges || {};
    Memory.freeEdges[this.identifier()] = openSpots;
  }

  return Memory.freeEdges[this.identifier()];
};
