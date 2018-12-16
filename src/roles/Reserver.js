import Base from './Base';
import creepManager from '../utils/creep-manager';
import { MOVE, CLAIM } from '../utils/constants';

export default class Reserver extends Base {
  static role = 'reserver'

  static createCreepFor(spawn) {
    return spawn.room.getReserveFlags().reduce((prev, flag) => {
      if (prev) return prev;
      if (flag.room && flag.room.controller && flag.room.controller.my) return prev;
      const creepForFlag = creepManager.creepsWithRole(this.role).find((creep) => {
        return creep.memory.targetFlag === flag.name;
      });

      if (!creepForFlag) {
        return {
          memory: {
            role: this.role,
            targetFlag: flag.name,
          },
          body: [MOVE, CLAIM]
        }
      }
    }, undefined);
  }

  performRole() {
    const flag = Game.flags[this.memory.targetFlag];
    if (!flag) {
      return this.suicide();
    }
    if (this.room.name !== flag.pos.roomName) {
      return this.moveTo(flag);
    }
    const myRooms = Object.entries(Game.rooms).filter(([_, room]) => room.controller && room.controller.my);
    const shouldClaim = myRooms.length < Game.gcl.level;
    if (shouldClaim) {
      return this.moveToAndClaim(this.room.controller);
    }
    return this.moveToAndReserve(this.room.controller);
  }

  moveToAndReserve(controller) {
    if (this.pos.getRangeTo(controller) > 1) {
      this.moveTo(controller);
    } else {
      this.reserveController(controller);
    }
  }

  moveToAndClaim(controller) {
    if (this.pos.getRangeTo(controller) > 1) {
      this.moveTo(controller);
    } else {
      this.claimController(controller);
    }
  }
}
