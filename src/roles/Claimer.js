import Base from './Base';

export default class Claimer extends Base {
  performRole() {
    if (this.findUnvisitedScoutFlags().length > 0) {
      this.scout();
    } else if (!this.room.getControllerOwned()) {
      this.moveToAndClaimController(this.room.controller);
    }
  }

  moveToAndClaimController(controller) {
    if (this.pos.getRangeTo(controller) > 1) {
      this.moveTo(controller);
    } else {
      if (this.claimController(controller) === 0) {
        const claimFlag = Game.claimFlags().filter(flag => {
          return flag.pos.getRangeTo(controller) === 0;
        })[0];

        if (claimFlag) {
          claimFlag.remove();
        }
      }
    }
  }
}
