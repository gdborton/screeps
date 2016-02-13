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
        scoutFlags = Game.flagArray().filter(function(flag) {
          return flag.name.toLowerCase().indexOf('scout') !== -1;
        });
      }

      return scoutFlags;
    };

    Game.getCreepFlags = function() {
      if (creepFlags === undefined) {
        creepFlags = Game.flagArray().filter((flag) => {
          return flag.color === COLOR_PURPLE;
        });
      }

      return creepFlags;
    };

    Game.dismantleFlags = function() {
      return Game.flagArray().filter((flag) => {
        return flag.name.indexOf('dismantle') !== -1;
      });
    }
  }
};
