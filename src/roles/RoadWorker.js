import Base from './Base';

export default class RoadWorker extends Base {
  performRole() {
    if (this.carry.energy === 0) {
      const closestEnergySource = this.pos.findClosestByRange(this.room.getEnergyStockSources());
      if (closestEnergySource) {
        this.takeEnergyFrom(closestEnergySource);
      }
    } else {
      const roads = this.room.getRoads().filter(road => {
        return road.hits < road.hitsMax;
      });
      if (roads.length) {
        const road = this.pos.findClosestByRange(roads);
        this.moveToAndRepair(road);
      } else {
        this.suicide();
      }
    }
  }

  shouldBeRecycled() {
    return this.room.getDamagedRoads().length < 1;
  }
}
