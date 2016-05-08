/* @flow */
import { RoomPosition } from 'screeps-globals';

Object.assign(RoomPosition.prototype, {
  identifier() {
    return `${this.roomName}x${this.x}y${this.y}`;
  },

  freeEdges() {
    if (!(Memory.freeEdges && Memory.freeEdges[this.identifier()])) {
      Memory.freeEdges = Memory.freeEdges || {};
      Memory.freeEdges[this.identifier()] = this.openPositionsAtRange();
    }

    return Memory.freeEdges[this.identifier()];
  },

  openPositionsAtRange(range = 1) {
    const room = Game.rooms[this.roomName];
    const openPositions = [];
    const surroundings = room.lookAtArea(this.x - range, this.y - range, this.x + range, this.y + range); // eslint-disable-line max-len
    Object.keys(surroundings).forEach(x => {
      Object.keys(surroundings[x]).forEach(y => {
        const pos = new RoomPosition(+x, +y, this.roomName); // The + is for string -> number
        if (pos.getRangeTo(this) === range && pos.isOpen()) {
          openPositions.push(pos);
        }
      });
    });
    return openPositions;
  },

  isOpen() {
    const terrain = this.lookFor('terrain');
    return terrain === 'swamp' || terrain === 'plain';
  },
});
