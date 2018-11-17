import Base from './Base';
import creepManager from '../utils/creep-manager';

export default class Claimer extends Base {
  static role = 'claimer'

  static createCreepFor(spawn) {
    const creepsWithRole = creepManager.creepsWithRole(this.role).length;
    const claimFlags = Game.claimFlags();
    if (!creepsWithRole && claimFlags.length && spawn.room.energyCapacityAvailable >= 650) {
      return {
        memory: {
          role: this.role,
        },
        body: [MOVE, CLAIM],
      }
    }

    return undefined;
  }

  performRole() {
    if (!Game.claimFlags().length) this.suicide();
    const claimFlag = Game.claimFlags()[0];
    if (claimFlag.pos.roomName !== this.pos.roomName) {
      return this.moveTo(claimFlag);
    }
    return this.moveToAndClaim(this.room.controller);
  }
}
