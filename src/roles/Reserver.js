import Base from './Base';

export default class Reserver extends Base {
  performRole() {
    if (!this.memory.targetFlag) {
      this.aquireTarget();
    }

    const flag = Game.flags[this.memory.targetFlag];
    if (flag.reservationTime() >= 4999) {
      this.aquireTarget();
    } else {
      if (this.room.name !== flag.pos.roomName) {
        this.moveTo(flag);
      } else {
        this.moveToAndReserve(this.room.controller);
      }
    }
  }

  aquireTarget() {
    const flag = this.room.getReserveFlagsNeedingReservers()[0];
    if (flag) {
      this.memory.targetFlag = flag.name;
    }
  }

  moveToAndReserve(controller) {
    if (this.pos.getRangeTo(controller) > 1) {
      this.moveTo(controller);
    } else {
      this.reserveController(controller);
    }
  }

  shouldBeRecycled() {
    return Game.rooms[this.memory.room].getReserveFlagsNeedingReservers().length === 0;
  }
}
