import Base from './Base';

export default class Reserver extends Base {
  performRole() {
    const flag = this.room.getReserveFlags()[0];
    if (flag) {
      this.moveTo(flag);
    } else {
      this.moveToAndReserve(this.room.controller);
    }
  }

  moveToAndReserve(controller) {
    if (this.pos.getRangeTo(controller) > 1) {
      this.moveTo(controller);
    } else {
      this.reserveController(controller);
    }
  }
}
