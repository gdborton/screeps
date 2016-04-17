/* @flow */
import { RoomPosition } from 'screeps-globals';

Object.assign(RoomPosition.prototype, {
  identifier() {
    return `${this.roomName}x${this.x}y${this.y}`;
  },

  freeEdges() {
    if (!(Memory.freeEdges && Memory.freeEdges[this.identifier()])) {
      let openSpots = 0;
      const room = Game.rooms[this.roomName];
      const surroundings = room.lookAtArea(this.y - 1, this.x - 1, this.y + 1, this.x + 1);
      Object.keys(surroundings).forEach(x => {
        Object.keys(surroundings[x]).forEach(y => {
          openSpots = openSpots + surroundings[x][y].filter(object => {
            const isTerrain = object.type === 'terrain';
            return isTerrain && (object.terrain === 'swamp' || object.terrain === 'plain');
          }).length;
        });
      });

      Memory.freeEdges = Memory.freeEdges || {};
      Memory.freeEdges[this.identifier()] = openSpots;
    }

    return Memory.freeEdges[this.identifier()];
  },
});
