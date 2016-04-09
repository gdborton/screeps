/* @flow */

function getFlagsOfType(type) {
  return Game.flagArray().filter(flag => {
    return flag.name.toLowerCase().indexOf(type) !== -1;
  });
}

let scoutFlags;
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
};

export default {
  setup() {
    scoutFlags = undefined;
    Object.assign(Game, enhancedGame);
  },
};
