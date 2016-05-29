/* @flow */
// Order here is important. These modify global prototypes.
import 'screeps-perf';
import game from './game';
import './source';
import './room';
import './structures/_base';
import './room-position';
import './flag';
import './controller';
import profiler from 'screeps-profiler';
import { Room } from 'screeps-globals';

profiler.enable();

export function loop() {
  if (Room.prototype.work && Game.cpuLimit > 100) {
    profiler.wrap(() => {
      game.setup();
      Object.keys(Game.rooms).forEach(roomName => {
        Game.rooms[roomName].work();
      });
    });
  }
}
