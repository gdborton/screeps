import roleMap from '../utils/role-map';

function enhanceCreep(creep) {
  return new roleMap[creep.memory.role](creep);
}

function convertCreeps() {
  return Object.keys(Game.creeps).map(creepName => {
    const creep = Game.creeps[creepName];
    return enhanceCreep(creep);
  });
}

class CreepManager {
  creeps() {
    return convertCreeps();
  }

  creepsWithRole(role) {
    return this.creeps().filter(creep => creep.memory.role === role);
  }

  // Occasionally we find a creep that is not enhanced... so we enhance it.
  enhanceCreep(creep) {
    return enhanceCreep(creep);
  }
}

const creepManager = new CreepManager();

export default creepManager;
