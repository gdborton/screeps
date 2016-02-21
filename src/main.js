// Order here is important. These modify global prototypes.
import 'screeps-perf';
import game from './game';
import './creep';
import './source';
import './spawns';
import './structures';
import './room-position';
import './flag';
import profiler from 'screeps-profiler';

profiler.enable();

export function loop() {
  if (Room.prototype.work && Game.cpuLimit > 100) {
    profiler.wrap(() => {
      game.setup();
      Object.keys(Game.rooms).forEach((roomName, index) => {
        if (index === 1 || Game.cpuLimit > 50) {
          Game.rooms[roomName].work();
        }
      });
    });
  }
}
