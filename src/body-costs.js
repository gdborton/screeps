const bodyCosts = {
  [MOVE]: 50,
  [WORK]: 100,
  [CARRY]: 50,
  [ATTACK]: 80,
  [RANGED_ATTACK]: 150,
  [HEAL]: 250,
  [TOUGH]: 10,
};

bodyCosts.calculateCosts = (bodyParts) => {
  let cost = 0;
  bodyParts.forEach((bodyPart) => {
    const part = typeof bodyPart === 'string' ? bodyPart : bodyPart.type;
    cost += bodyCosts[part];
  });

  return cost;
};

export default bodyCosts;
