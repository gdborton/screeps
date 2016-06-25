/* @flow */
import { Flag } from 'screeps-globals';
import creepManager from './utils/creep-manager';

const neutralStructures = [
  STRUCTURE_ROAD,
  STRUCTURE_CONTAINER,
];

Object.assign(Flag.prototype, {
  work() {
    if (this.name.toLowerCase().indexOf('build') !== -1) {
      const parts = this.name.split('_');
      const target = parts[1];
      let shouldBuild = false;
      const ownedRoom = this.room.getControllerOwned();
      const neutralStructure = neutralStructures.indexOf(target) !== -1;
      if (target && CONTROLLER_STRUCTURES[target] && (ownedRoom || neutralStructure)) {
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
    } else if (this.isReserveFlag()) {
      this.performReserveFlagRole();
    }
  },

  isReserveFlag() {
    return this.name.indexOf('reserve') === 0;
  },

  performReserveFlagRole() {
    const rate = 5;
    if (Game.time % rate === 0) {
      const room = Game.roomArray().find(potentialRoom => potentialRoom.name === this.pos.roomName);
      if (room) {
        const reservation = room.controller.reservation;
        const reservationTime = reservation && reservation.ticksToEnd || 0;
        this.memory.reservationTime = reservationTime;
        this.memory.sources = room.getSources().map(source => source.id);
      }
    } else {
      this.memory.reservationTime = Math.max(this.memory.reservationTime - rate, 0);
    }

    if (this.reservationTime() >= 4999) {
      this.memory.needsReserver = false;
    } else if (this.reservationTime() < 500) {
      this.memory.needsReserver = true;
    }
  },

  reservationTime() {
    if (this.memory.reservationTime === undefined) {
      this.memory.reservationTime = 0;
    }

    return this.memory.reservationTime;
  },

  needsReserver() {
    return this.isReserveFlag() && this.memory.needsReserver;
  },

  needsRemoteHarvesters() {
    const remoteHarvesters = creepManager.creepsWithRole('remoteharvester').filter(creep => {
      return creep.memory.flag === this.name;
    });

    return remoteHarvesters.length < this.memory.sources.length;
  },
});
