import Base from './Base';
import { MOVE, CARRY, RESOURCE_ENERGY } from '../utils/constants';

export default class Gatherer extends Base {
  static role = 'gatherer'

  performRole() {
    if (!this.isFull()) {
      const targetContainer = this.room.getContainers().reduce((prev, container) => {
        if (!prev || container.store[RESOURCE_ENERGY] > prev.store[RESOURCE_ENERGY]) return container;
        return prev;
      }, undefined);

      if (targetContainer) {
        this.takeEnergyFrom(targetContainer);
      }
    }
  }

  static createCreepFor(spawn) {
    if (spawn.room.hasLinksConfigured() && !spawn.room.getCreepsWithRole(this.role).length) {
      return {
        memory: {
          role: this.role,
        },
        body: [MOVE, CARRY]
      };
    }
    return undefined;
  }
}