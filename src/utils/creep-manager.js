import roleMap from '../utils/role-map';

function enhanceCreep(creep) {
  // console.log(JSON.stringify(creep.memory));
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
    return this.creeps().filter(creep => creep && creep.memory.role === role);
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
