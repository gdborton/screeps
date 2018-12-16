import Base from './Base';
import { MOVE, CARRY } from '../utils/constants';
import Upgrader from './Upgrader';
import Miner from './Miner';
import Builder from './Builder';

export default class Distributor extends Base {
  static role = 'distributor'

  energySources() {
    return [
      ...this.room.getControllerLinks(),
      ...[this.room.getStorage()],
      ...this.room.getDroppedEnergy(),
    ].filter(Boolean);
  }

  performRole() {
    const storage = this.room.getStorage();

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
      ...this.room.getCreepsWithRole(Builder.role),
    ]);

    target = target || targetTower || targetCreep;
    if (target) {
      if (this.isEmpty()) {
        return this.gatherEnergy();
      }
      return this.deliverEnergyTo(target);
    } else {
      const storageLink = this.room.getControllerLinks()[0];
      if (storage && storageLink) {
        if (!this.isEmpty()) {
          return this.deliverEnergyTo(storage);
        } else if (!storageLink.isEmpty()) {
          return this.takeEnergyFrom(storageLink);
        }
        return this.gatherEnergy();
      } else {
        return this.gatherEnergy();
      }
    }
  }

  static createCreepFor(spawn) {
    // walkDistance = 2 * (totalPathDistanceFromControllerToEachSource)
    // transitRate = carryCapacity / walkdistance * (distance / tick)
    // ^ basically a measure of how effective each distributor is.
    // transitRate should roughly equal the total production, most rooms 20/tick.
    const creepsWithRole = spawn.room.getCreepsWithRole(this.role);
    let target = 1;
    const body = [MOVE, CARRY, MOVE, CARRY, MOVE, CARRY];
    if (spawn.room.hasLinksConfigured() && spawn.room.getStorage()) {
      target = 1;
    } else if (spawn.room.controller && spawn.room.getCreepsWithRole(Miner.role).length) {
      const walkDistance = spawn.room.getSources().reduce((prev, source) => {
        return prev + spawn.room.controller.pos.findOptimalPathTo(source).length;
      }, 0);

      const transitRate = 150 / walkDistance;
      target = Math.min(spawn.room.maxEnergyProducedPerTick() / transitRate, 5);
    }

    if (creepsWithRole.length < target) {
      return {
        memory: {
          role: this.role,
        },
        // basically the cost of a spawn
        body,
      }
    }
    return undefined;
  }
}