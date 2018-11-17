import roleMap from '../utils/role-map';

function enhanceCreep(creep) {
  return new roleMap[creep.memory.role](creep);
}

function convertCreeps() {
  return Object.keys(Game.creeps).map(creepName => {
    const creep = Game.creeps[creepName];

    if (creep) {
      return enhanceCreep(creep);
    }
  }).filter(Boolean);
}

class CreepManager {
  creeps() {
    return convertCreeps();
  }

  creepsWithRole(role) {
    return this.creeps().filter(creep => {
      try {
        return creep && creep.memory.role === role;
      } catch(e) {
        return false;
      }
    });
  }

  // Occasionally we find a creep that is not enhanced... so we enhance it.
  enhanceCreep(creep) {
    return enhanceCreep(creep);
  }
}

const creepManager = new CreepManager();

Creep.prototype.enhance = function enhance() {
  return creepManager.enhanceCreep(this);
};

export default creepManager;
