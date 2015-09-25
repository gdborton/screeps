var bodyCosts = {};

bodyCosts[MOVE] = 50;
bodyCosts[WORK] = 100;
bodyCosts[CARRY] = 50;
bodyCosts[ATTACK] = 80;
bodyCosts[RANGED_ATTACK] = 150;
bodyCosts[HEAL] = 250;
bodyCosts[TOUGH] = 10;

bodyCosts.calculateCosts = function(bodyParts) {
  var cost = 0;
  bodyParts.forEach(function(bodyPart) {
    var part = typeof bodyPart === 'string' ? bodyPart : bodyPart.type;
    cost += bodyCosts[part];
  });

  return cost;
};

module.exports = bodyCosts;
