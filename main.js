require('creep');
require('source');
require('spawns');
require('structures');
require('room-position');
var profiler = require('profiler');

profiler.enable();
module.exports.loop = function() {
  profiler.wrap(function() {
    for (var roomName in Game.rooms) {
      Game.rooms[roomName].work();
    }
  });
}
