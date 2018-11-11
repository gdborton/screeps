import Base from './Base';

export default class RemoteCourier extends Base {
  performRole() {
    if (this.isFull()) {
      this.memory.task = 'dropoff';
    } else if (this.isEmpty()) {
      this.memory.task = 'pickup';
    }

    if (this.memory.task === 'pickup') {
      this.performPickup();
    } else {
      this.performDropOff();
    }
  }

  isFull() {
    return this.carry.energy === this.carryCapacity;
  }

  isEmpty() {
    return this.carry.energy === 0;
  }

  flag() {
    return Game.flags[this.memory.flag];
  }

  performPickup() {
    if (!this.flag()) return this.suicide();
    if (this.room.name !== this.flag().pos.roomName) {
      this.moveTo(this.flag());
    } else {
      const target = this.room.getEnergySourcesThatNeedsStocked()[0];
      this.takeEnergyFrom(target);
    }
  }

  performDropOff() {
    if (this.room !== this.getSpawn().room) {
      this.moveTo(this.getSpawn());
    } else {
      const storage = this.room.getStorage();
      if (storage) {
        this.deliverEnergyTo(storage);
      }
    }
  }
}
