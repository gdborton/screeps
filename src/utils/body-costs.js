/* @flow */
export default {
  calculateCosts(bodyParts): number {
    let cost = 0;
    bodyParts.forEach((bodyPart) => {
      const part = typeof bodyPart === 'string' ? bodyPart : bodyPart.type;
      cost += BODYPART_COST[part];
    });

    return cost;
  },

  costFor(creepName) {
    return this.calculateCosts(Game.creeps[creepName].body);
  },

  perTickCostFor(creepName, distance) {
    return this.costFor(creepName) / (1500 - distance);
  },

  perTickCostForCreeps() {
    return Object.keys(Game.creeps).reduce((acc, name) => {
      acc[name] = this.perTickCostFor(name);
      return acc;
    }, {});
  },
};
