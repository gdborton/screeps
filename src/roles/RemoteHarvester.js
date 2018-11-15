import Base from './Base';

export default class RemoteHarvester extends Base {
  static role = 'remoteharvester'

  performRole() {
    const flag = Game.flags[this.memory.flag];
    if (!flag) {
      this.memory.role = 'harvester';
      return;
    }
    const targetRoomName = flag.pos.roomName;
    if (this.room.name !== targetRoomName) {
      return this.moveTo(flag);
    } else {
      if (!this.memory.source) {
        this.acquireTarget();
      }
      const inRange = thing => this.pos.getRangeTo(thing) < 4;
      const constructionSites = this.room.getConstructionSites().filter(inRange);
      const buildAbility = this.body.reduce((prev, { type }) => {
        if (type === WORK) return prev + 5;
        return prev;
      }, 0);

      if (constructionSites.length && this.carry[RESOURCE_ENERGY] > buildAbility) {
        this.moveToAndBuild(constructionSites[0]);
      } else if (!this.isFull()) {
        return this.moveToAndHarvest(this.targetSource());
      } else {
        return this.handleFull();
      }
    }
  }

  handleFull() {
    const inRange = thing => this.pos.getRangeTo(thing) < 4;
    const container = this.room.getContainers().find(inRange);
    if (container) {
      if (container.needsRepaired()) {
        this.moveToAndRepair(container); // repair if needed.
      } else {
        if (!container.isFull()) {
          return this.deliverEnergyTo(container);
        }
        return this.drop(RESOURCE_ENERGY);
      }
    }
  }

  isFull() {
    return !(this.carry.energy < this.carryCapacity || this.carry.energy === 0);
  }

  acquireTarget() {
    this.memory.source = this.room.getSourcesNeedingHarvesters()[0].id;
  }
}
