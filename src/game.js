/* @flow */

function getFlagsOfType(type) {
  return Game.flagArray().filter(flag => {
    return flag.name.toLowerCase().indexOf(type) !== -1;
  });
}

let scoutFlags;
let roomDistanceMap = {};
const enhancedGame = {
  flagArray() {
    return Object.keys(Game.flags).map(flagName => {
      return Game.flags[flagName];
    });
  },

  clearScoutFlags() {
    Game.getScoutFlags().forEach(flag => {
      flag.remove();
    });
  },

  getScoutFlags() {
    if (scoutFlags === undefined) {
      scoutFlags = getFlagsOfType('scout');
    }

    return scoutFlags;
  },

  dismantleFlags() {
    return getFlagsOfType('dismantle');
  },

  claimFlags() {
    return getFlagsOfType('claim');
  },

  getClosestOwnedRoomTo(targetRoomName) {
    if (!roomDistanceMap[targetRoomName]) {
      roomDistanceMap[targetRoomName] = Object.keys(Game.rooms).sort((roomNameA, roomNameB) => {
        const roomA = Game.rooms[roomNameA];
        const roomB = Game.rooms[roomNameB];
        return roomA.distanceToRoom(targetRoomName) - roomB.distanceToRoom(targetRoomName);
      })[0];
    }
    return roomDistanceMap[targetRoomName];
  },
};

export default {
  setup() {
    scoutFlags = undefined;
    Object.assign(Game, enhancedGame);
  },
};
