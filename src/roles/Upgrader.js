import Base from './Base';

import { MOVE, CARRY, WORK } from '../utils/constants';

export default class Upgrader extends Base {
  static role = 'upgrader'

  static createCreepFor(spawn) {
    if (spawn.room.getConstructionSites().length) return undefined;
    const creepsWithRole = spawn.room.getCreepsWithRole(this.role).length;
    let target = spawn.room.maxEnergyProducedPerTick() / 4;
    const storage = spawn.room.getStorage();
    if (storage && storage.availableEnergy() < 100000) {
      target = 1;
    }
    if (creepsWithRole < target) {
      return {
        memory: {
          role: this.role,
        },
        body: [
          MOVE,
          CARRY,
          WORK, WORK, WORK, WORK
        ],
      };
    }
    return undefined;
  }

  performRole() {
    const { controller } = this.room;
    if (controller) {
      const storage = this.room.getStorage();
      const inRangeOfController = this.pos.inRangeTo(controller, 3);
      const nextToStorage = storage && this.pos.isNearTo(storage);
      if (inRangeOfController && nextToStorage) {
        if (this.isEmpty()) {
          return this.takeEnergyFrom(storage);
        }
        return this.upgradeController(controller);
      }
      return this.moveToAndUpgrade(controller);
    }
  }

  needsEnergy() {
    const { controller } = this.room;
    if (!(controller && controller.my)) return false;
    const storage = this.room.getStorage();
    if (storage && this.pos.isNearTo(storage)) return false;
    return this.isEmpty() && this.pos.inRangeTo(controller, 3);
  }
}
