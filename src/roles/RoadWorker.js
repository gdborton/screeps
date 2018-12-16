import Base from './Base';

export default class RoadWorker extends Base {
  static role = 'roadworker'

  static createCreepFor(spawn) {
    if (spawn.room.hasDamagedRoads() && !spawn.room.getCreepsWithRole(this.role).length) {
      return {
        memory: {
          role: this.role,
        },
        body: [
          MOVE, CARRY, WORK
        ],
      };
    }
    return undefined;
  }

  performRole() {
    if (this.carry.energy === 0) {
      const closestEnergySource = this.pos.findClosestByRange(this.room.getEnergyStockSources());
      if (closestEnergySource) {
        this.takeEnergyFrom(closestEnergySource);
      }
    } else {
      const roads = [
        ...this.room.getRoads(),
        ...this.room.getContainers(),
      ].filter(road => {
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
