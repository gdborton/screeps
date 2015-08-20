// Finds the number of open spots next to an adjacent source.
var room = Game.spawns.Spawn1.room;
if (!Memory.sourcesAssessed) {
  var sources = room.find(FIND_SOURCES);
  sources.forEach(function(source) {
    var openSpots = 0;
    var surroundings = room.lookAtArea(source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1);
    Object.keys(surroundings).forEach(function(x) {
      Object.keys(surroundings[x]).forEach(function(y) {
        openSpots = openSpots + surroundings[x][y].filter(function(object) {
          return object.type === 'terrain' && (object.terrain === 'swamp' || object.terrain === 'plain');
        }).length
      });
    });

    Memory.sources = Memory.sources || {};
    Memory.sources[source.id] = openSpots;
  });

  Memory.sourcesAssessed = true;
}
