import Base from './Base';

export default class Harvester extends Base {
  performRole() {
    if (this.carry.energy < this.carryCapacity || this.carry.energy === 0) {
      const source = this.targetSource();
      this.moveToAndHarvest(source);
    } else if (this.room.courierCount() === 0 && this.getSpawn().availableEnergy() < 300) {
      this.deliverEnergyTo(this.getSpawn());
    } else {
      const storage = this.room.getStorage();
      const towers = this.room.getTowers().filter(tower => !tower.isFull());
      const closestTower = this.pos.findClosestByRange(towers);
      const links = this.room.getLinks();
      const closestLink = this.pos.findClosestByRange(links);
      const rangeToStore = storage ? this.pos.getRangeTo(storage) : 100;

      if (storage && storage.store.energy < storage.storeCapacity * 0.3 && rangeToStore === 1) {
        this.deliverEnergyTo(storage);
      } else if (links.length && this.pos.getRangeTo(closestLink) <= 2 && !closestLink.isFull()) {
        this.deliverEnergyTo(closestLink);
      } else if (storage && storage.store.energy < storage.storeCapacity && rangeToStore === 1) {
        this.deliverEnergyTo(storage);
      } else if (closestTower && this.pos.getRangeTo(closestTower) <= 2) {
        this.deliverEnergyTo(closestTower);
      } else {
        this.drop(RESOURCE_ENERGY);
      }
    }
  }
}
