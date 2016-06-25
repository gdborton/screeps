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
