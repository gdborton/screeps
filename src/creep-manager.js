import roleMap from './utils/role-map';

function convertCreeps() {
  return Object.keys(Game.creeps).map(creepName => {
    const creep = Game.creeps[creepName];
    return new roleMap[creep.memory.role](creep);
  });
}

class CreepManager {
  creeps() {
    return convertCreeps();
  }
}

const creepManager = new CreepManager();

export default creepManager;
