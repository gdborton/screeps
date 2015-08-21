require('creep');
require('source');
require('spawns');

Object.keys(Game.spawns).forEach(function(spawnName) {
  var spawn = Game.spawns[spawnName];
  if (spawn.energy === spawn.energyCapacity) {
    spawn.work();
  }
});

for (var name in Game.creeps) {
  var creep = Game.creeps[name];
  creep.work();
}
