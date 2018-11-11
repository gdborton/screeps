import Base from './Base';
import { MOVE, CARRY } from '../utils/constants';
import Upgrader from './Upgrader';

export default class Distributor extends Base {
  static role = 'distributor'

  performRole() {
    this.say(this.role());
    const storage = this.room.getStorage();
    let storageLink;
    const controllerLinkPos = this.room.determineControllerLinkLocation();
    if (controllerLinkPos) {
      const structures = controllerLinkPos.lookFor(LOOK_STRUCTURES);
      storageLink = structures.find(structure => structure.structureType === STRUCTURE_LINK);
    }

    const closestNeedingEnergy = (things) => {
      return things.reduce((prev, thing) => {
        if (thing.needsEnergy() && (!prev || this.pos.getRangeTo(thing) <= this.pos.getRangeTo(prev))) {
          return thing;
        }
        return prev;
      }, undefined);
    };

    let target = closestNeedingEnergy(this.room.getSpawnStructures());
    const targetTower = closestNeedingEnergy(this.room.getTowers());
    const targetCreep = closestNeedingEnergy([
      ...this.room.getCreepsWithRole(Upgrader.role),
    ]);

    target = target || targetCreep || targetTower;
    if (target) {
      if (this.isEmpty()) {
        if (storageLink && storageLink.totalUtilizedCapacity() > this.availableSpace()) {
          return this.takeEnergyFrom(storageLink);
        }
        if (storage) {
          return this.takeEnergyFrom(storage);
        }
      }
      return this.deliverEnergyTo(target);
    } else if (storage && storageLink) {
      if (!this.isEmpty()) {
        return this.deliverEnergyTo(storage);
      } else if (!storageLink.isEmpty()) {
        return this.takeEnergyFrom(storageLink);
      }
    }
  }

  static createCreepFor(spawn) {
    if (spawn.room.hasLinksConfigured() && spawn.room.getStorage() && !spawn.room.getCreepsWithRole(this.role).length) {
      return {
        memory: {
          role: this.role,
        },
        // basically the cost of a spawn
        body: [MOVE, CARRY, MOVE, CARRY, MOVE, CARRY],
      }
    }
    return undefined;
  }
}