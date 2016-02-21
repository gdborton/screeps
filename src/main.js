require('./perf')();
var game = require('./game');
require('./creep');
require('./source');
require('./spawns');
require('./structures');
require('./room-position');
require('./flag');
var profiler = require('./profiler');
profiler.enable();

module.exports = {
  loop() {
    if (Room.prototype.work && Game.cpuLimit > 100) {
      profiler.wrap(function () {
        game.setup();
        Object.keys(Game.rooms).forEach((roomName, index) => {
          if (index === 1 || Game.cpuLimit > 50) {
            Game.rooms[roomName].work();
          }
        });
      });
    }
  }
};
