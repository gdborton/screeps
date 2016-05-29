import Base from './Base';

export default class Upgrader extends Base {
  performRole() {
    const empty = this.carry.energy === 0;
    if (!empty) {
      this.moveToAndUpgrade(this.room.controller);
    } else if (empty && this.room.droppedControllerEnergy()) {
      this.takeEnergyFrom(this.room.droppedControllerEnergy());
    } else if (empty && this.room.getLinks().length) {
      const closestLink = this.pos.findClosestByRange(this.room.getLinks());
      if (this.pos.getRangeTo(closestLink) < 5) {
        this.takeEnergyFrom(closestLink);
      } else {
        this.moveToAndUpgrade(this.room.controller);
      }
    }
  }
}
