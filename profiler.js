var usedOnStart = 0;

if (Game.rooms.sim) {
  Game.getUsedCpu = function() {
    return Game.rooms.sim ? performance.now() - usedOnStart : Game.getUsedCpu();
  };
}

usedOnStart = Game.getUsedCpu();
