function getFlagsOfType(type) {
  return Game.flagArray().filter((flag) => {
    return flag.name.toLowerCase().indexOf(type) !== -1;
  });
}

export default {
  setup() {
    let scoutFlags;

    Game.flagArray = function flagArray() {
      return Object.keys(Game.flags).map((flagName) => {
        return Game.flags[flagName];
      });
    };

    Game.clearScoutFlags = function clearScoutFlags() {
      Game.getScoutFlags().forEach((flag) => {
        flag.remove();
      });
    };

    Game.getScoutFlags = function getScoutFlags() {
      if (scoutFlags === undefined) {
        scoutFlags = getFlagsOfType('scout');
      }

      return scoutFlags;
    };

    Game.dismantleFlags = function dismantleFlags() {
      return getFlagsOfType('dismantle');
    };

    Game.claimFlags = function claimFlags() {
      return getFlagsOfType('claim');
    };
  },
};
