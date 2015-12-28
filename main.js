require('perf');
require('creep');
require('source');
require('spawns');
require('structures');
require('room-position');
var profiler = require('profiler');

profiler.enable();
module.exports.loop = function() {
  profiler.wrap(function() {
    var index = 0;
    for (var roomName in Game.rooms) {
      index++;
      if (index === 1 || Game.cpuLimit > 40) {
        Game.rooms[roomName].work();
      }
    }
  });
}
