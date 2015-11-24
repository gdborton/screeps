require('creep');
require('source');
require('spawns');
require('structures');
require('room-position');
var profiler = require('profiler');

//profiler.enable();
module.exports.loop = function() {
  profiler.profile(function() {
    for (var spawnName in Game.spawns) {
      var spawn = Game.spawns[spawnName];
      spawn.work();
    }

    for (var name in Game.creeps) {
      var creep = Game.creeps[name];
      creep.work();
    }
  });
}
