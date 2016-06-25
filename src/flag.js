/* @flow */
import { Flag } from 'screeps-globals';

Object.assign(Flag.prototype, {
  work() {
    if (this.name.toLowerCase().indexOf('build') !== -1 && this.room.getControllerOwned()) {
      const parts = this.name.split('_');
      const target = parts[1];
      let shouldBuild = false;

      if (target && CONTROLLER_STRUCTURES[target]) {
        const max = CONTROLLER_STRUCTURES[target][this.room.controller.level];
        const current = this.room.find(target).length;
        shouldBuild = current < max;
        shouldBuild = shouldBuild && this.pos.isOpen();
      }

      if (shouldBuild) {
        const result = this.room.createConstructionSite(this.pos.x, this.pos.y, target);
        if (result === 0) {
          this.remove();
        }
      }
    } else if (this.name.toLowerCase() === 'rampart') {
      if (!this.pos.isOpen()) {
        const structure = this.pos.lookFor('structure')[0];
        if (structure) {
          structure.destroy();
        }
      } else {
        const result = this.room.createConstructionSite(this.pos.x, this.pos.y, STRUCTURE_RAMPART);
        if (result === 0) {
          this.remove();
        }
      }
    }
  },

  isReserveFlag() {
    return this.name.indexOf('reserve') === 0;
  },
});
