import Base from './Base';

export default class Scout extends Base {
  performRole() {
    if (this.findUnvisitedScoutFlags().length > 0) {
      if (this.room.getDismantleFlag()) {
        this.dismantleFlag(this.room.getDismantleFlag());
      } else {
        this.scout();
      }
    } else if (this.room.getConstructionSites().length && this.carry.energy > 0) {
      this.moveToAndBuild(this.pos.findClosestByRange(this.room.getConstructionSites()));
    } else if (this.carry.energy === 0) {
      const droppedEnergies = this.room.getDroppedEnergy();
      if (droppedEnergies.length > 0) {
        this.takeEnergyFrom(droppedEnergies[0]);
      }
    } else {
      this.moveToAndUpgrade(this.room.controller);
    }
  }
}
