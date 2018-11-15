import Base from './Base';
import { MOVE, CARRY, RESOURCE_ENERGY } from '../utils/constants';

export default class Gatherer extends Base {
  static role = 'gatherer'

  performRole() {
    if (!this.isFull()) {
      let currentTarget = Game.getObjectById(this.memory.target);
      if (!currentTarget || currentTarget.totalUtilizedCapacity() < this.availableSpace()) {
        const targetContainer = this.room.getContainers().reduce((prev, container) => {
          if (!prev || container.totalUtilizedCapacity() > prev.totalUtilizedCapacity()) {
            return container;
          }
          return prev;
        }, undefined);

        this.memory.target = targetContainer.id;
        currentTarget = targetContainer;
      }
      return this.takeEnergyFrom(currentTarget);
    } else {
      const sourceLinks = this.room.getLinks().filter(link => link.needsEnergy());
      if (sourceLinks.length) {
        return this.deliverEnergyTo(this.pos.findClosestByRange(sourceLinks));
      }
    }
  }

  static createCreepFor(spawn) {
    if (spawn.room.hasLinksConfigured() && !spawn.room.getCreepsWithRole(this.role).length) {
      return {
        memory: {
          role: this.role,
        },
        body: [MOVE, CARRY],
      };
    }
    return undefined;
  }
}