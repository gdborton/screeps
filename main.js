require('perf');
require('creep');
require('source');
require('spawns');
require('structures');
require('room-position');
var profiler = require('profiler');

profiler.enable();
module.exports.loop = function() {
  var wastedCPU = Game.getUsedCpu();
  if (!Memory.requireProfile) {
    Memory.requireProfile = {
      requireCPU: 0,
      ticks: 0,
      runningOverhead: 0,
      usedCPU: 0,
      avgUsedCPU: 0
    }
  }
  profiler.wrap(function() {
    var index = 0;
    for (var roomName in Game.rooms) {
      index++;
      if (index === 1 || Game.cpuLimit > 40) {
        Game.rooms[roomName].work();
      }
    }
  });
  Memory.requireProfile.requireCPU = Memory.requireProfile.requireCPU + wastedCPU;
  Memory.requireProfile.ticks++;
  Memory.requireProfile.runningOverhead = Memory.requireProfile.requireCPU / Memory.requireProfile.ticks;
  Memory.requireProfile.usedCPU = Memory.requireProfile.usedCPU + Game.getUsedCpu() - wastedCPU;
  Memory.requireProfile.avgUsedCPU = Memory.requireProfile.usedCPU / Memory.requireProfile.ticks;
}
