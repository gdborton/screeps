require('creep');
require('source');
require('spawns');
require('structures');

for (var spawnName in Game.spawns) {
  var spawn = Game.spawns[spawnName];
  spawn.work();
}

for (var name in Game.creeps) {
  var creep = Game.creeps[name];
  creep.work();
}
