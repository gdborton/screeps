import Base from './Base';

export default class RemoteHarvester extends Base {
  performRole() {
    const flag = Game.flags[this.memory.flag];
    const targetRoomName = flag.pos.roomName;
    if (this.room.name !== targetRoomName) {
      this.moveTo(flag);
    } else {
      if (!this.memory.source) {
        this.acquireTarget();
      }
      if (!this.isFull()) {
        this.moveToAndHarvest(this.targetSource());
      } else {
        this.handleFull();
      }
    }
  }

  handleFull() {
    const inRange = thing => this.pos.getRangeTo(thing) < 4;
    const constructionSites = this.room.getConstructionSites().filter(inRange);
    const container = this.room.getContainers().find(inRange);

    if (constructionSites.length) {
      this.moveToAndBuild(constructionSites[0]);
    } else if (container) {
      if (container.needsRepaired()) {
        this.moveToAndRepair(container); // repair if needed.
      } else {
        this.deliverEnergyTo(container);
      }
    } else {
      const buildPosition = this.pos.buildablePositionsAtRange(1)[0];
      this.room.placeContainerFlag(buildPosition);
    }
  }

  isFull() {
    return !(this.carry.energy < this.carryCapacity || this.carry.energy === 0);
  }

  acquireTarget() {
    this.memory.source = this.room.getSourcesNeedingHarvesters()[0].id;
  }
}
