import './_base';

export default class Tower extends StructureTower {
  performRole() {
    if (this.room.hasHostileCreeps() && !this.isEmpty()) {
      this.attack(this.pos.findClosestByRange(this.room.getHostileCreeps()));
    } else if (this.energy > this.energyCapacity / 2) {
      const buildings = this.room.damagedBuildings().sort((buildingA, buildingB) => {
        return buildingA.hits - buildingB.hits;
      });
      if (buildings.length) {
        this.repair(buildings[0]);
      }
    }
  }
}
