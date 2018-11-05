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
      const constructionSites = this.room.getConstructionSites();
      const closestConstructionSite = this.pos.findClosestByRange(constructionSites);

      if (closestConstructionSite && this.pos.getRangeTo(closestConstructionSite) <= 3) {
        this.moveToAndBuild(closestConstructionSite);
      } else {
        this.drop(RESOURCE_ENERGY);
      }
    }
  }
}
