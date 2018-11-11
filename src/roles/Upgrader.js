import Base from './Base';
import Distributor from './Distributor';

export default class Upgrader extends Base {
  static role = 'upgrader'

  distributorRole() {
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

  performRole() {
    if (this.room.getCreepsWithRole(Distributor.role).length) {
      return this.distributorRole();
    }
    const empty = this.carry.energy === 0;
    if (!empty) {
      return this.moveToAndUpgrade(this.room.controller);
    } else if (empty && this.room.droppedControllerEnergy()) {
      return this.takeEnergyFrom(this.room.droppedControllerEnergy());
    } else if (empty && this.room.getLinks().length) {
      const closestLink = this.pos.findClosestByRange(this.room.getLinks());
      if (this.pos.getRangeTo(closestLink) < 5) {
        return this.takeEnergyFrom(closestLink);
      } else {
        return this.moveToAndUpgrade(this.room.controller);
      }
    }
  }

  needsEnergy() {
    const storage = this.room.getStorage();
    if (storage && this.pos.isNearTo(storage)) return false;
    return this.isEmpty();
  }
}
