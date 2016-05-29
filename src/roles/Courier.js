import Base from './Base';

export default class Courier extends Base {
  performRole() {
    const potentialTargets = this.room.getStructresNeedingEnergyDelivery();
    let dumpTarget = this.pos.findClosestByRange(potentialTargets);

    if (this.carry.energy === this.carryCapacity) {
      this.memory.task = 'deliver';
    } else if (!dumpTarget || this.carry.energy === 0) {
      this.memory.task = 'pickup';
    }

    if (!dumpTarget) {
      dumpTarget = this.room.getControllerEnergyDropFlag();
    }

    if (this.memory.task === 'pickup') {
      if (!this.memory.target) {
        const target = this.room.getEnergySourcesThatNeedsStocked()[0];
        this.memory.target = target ? target.id : '';
      }

      if (this.memory.target) {
        const target = Game.getObjectById(this.memory.target);
        let result;
        if (target) {
          result = this.takeEnergyFrom(target);
        }
        if (!target || result === 0) {
          this.memory.target = '';
        }
      } else {
        this.deliverEnergyTo(dumpTarget);
      }
    } else {
      this.deliverEnergyTo(dumpTarget);
    }
  }
}
