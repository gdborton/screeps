function getFlagsOfType(type) {
  return Game.flagArray().filter((flag) => {
    return flag.name.toLowerCase().indexOf(type) !== -1;
  });
}

module.exports = {
  setup: function() {
    var creepFlags;
    var scoutFlags;

    Game.flagArray = function() {
      return Object.keys(Game.flags).map((flagName) => {
        return Game.flags[flagName];
      });
    }

    Game.clearScoutFlags = function() {
      Game.getScoutFlags().forEach((flag) => {
        flag.remove();
      });
    };

    Game.getScoutFlags = function() {
      if (scoutFlags === undefined) {
        scoutFlags = getFlagsOfType('scout');
      }

      return scoutFlags;
    };

    Game.dismantleFlags = function() {
      return getFlagsOfType('dismantle');
    }

    Game.claimFlags = function() {
      return getFlagsOfType('claim');
    }
  }
};
