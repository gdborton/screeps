require('perf')();
require('creep');
require('source');
require('spawns');
require('structures');
require('room-position');
var profiler = require('profiler');
profiler.enable();

module.exports.loop = function() {
  // var start = Game.getUsedCpu();
  if (Room.prototype.work && Game.cpuLimit > 100) {
    // var workStart = 0;
    // var workEnd = 0;
    profiler.wrap(function () {
      //workStart = Game.getUsedCpu();
      Object.keys(Game.rooms).forEach((roomName, index) => {
        if (index === 1 || Game.cpuLimit > 50) {
          Game.rooms[roomName].work();
        }
      });
      //workEnd = Game.getUsedCpu();
    });
    //console.log('require time', start, 'work', workEnd - workStart, 'wrapped', Game.getUsedCpu() - start, 'total', Game.getUsedCpu());
  }
}
