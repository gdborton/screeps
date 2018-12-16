import Base from './Base';
import Miner from './Miner';
import bodyCosts from '../utils/body-costs';

export default class EmergencyHarvester extends Base {
  static role = 'emergencyharvester'
  static body = [
    MOVE, CARRY, MOVE, CARRY, WORK
  ];

  static createCreepFor(spawn) {
    const miners = spawn.room.getCreepsWithRole(Miner.role).length;
    const emergencyHarvesters = spawn.room.getCreepsWithRole(this.role).length;
    const minerCost = bodyCosts.calculateCosts(Miner.body);
    const canAffordMiner = spawn.room.energyAvailable > minerCost;
    let target = 1;
    if (spawn.room.energyCapacityAvailable < minerCost) {
      target = spawn.pos.findClosestByRange(spawn.room.getSources()).freeEdges();
    }
    if (emergencyHarvesters < target && ((miners < 1 && !canAffordMiner) || !spawn.room.hasContainersConfigured())) {
      return {
        memory: {
          role: this.role,
        },
        body: this.body,
      }
    }
    return undefined;
  }

  performRole() {
    if (this.isEmpty()) {
      this.memory.task = 'harvest';
    } else if (this.isFull()) {
      this.memory.task = 'spend';
    }

    if (this.memory.task === 'spend') {
      return this.spendResources();
    }

    return this.moveToAndHarvest(this.pos.findClosestByRange(this.room.getSources()));
  }
}
