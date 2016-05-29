import Base from './Base';

export default class Builder extends Base {
  performRole() {
    if (this.carry.energy === this.carryCapacity) {
      this.memory.task = 'work';
    } else if (this.carry.energy === 0 || this.memory.task === 'stockup') {
      this.memory.target = null;
      this.memory.task = 'stockup';
      if (this.room.droppedControllerEnergy()) {
        this.takeEnergyFrom(this.room.droppedControllerEnergy());
      } else if (this.room.getControllerLink() && !this.room.getControllerLink().isEmpty()) {
        this.takeEnergyFrom(this.room.getControllerLink());
      } else if (this.room.getStorage() && !this.room.getStorage().isEmpty()) {
        this.takeEnergyFrom(this.room.getStorage());
      }
    }

    if (this.memory.task === 'work') {
      this.attemptToUpgrade();
      const constructionSites = this.room.getConstructionSites();
      if (constructionSites.length) {
        const closestConstructionSite = this.pos.findClosestByRange(constructionSites);
        this.moveToAndBuild(closestConstructionSite);
      } else if (this.memory.target) {
        const target = Game.getObjectById(this.memory.target);
        if (target.hits < target.hitsMax) {
          this.moveToAndRepair(target);
        } else {
          this.memory.target = null;
        }
      } else {
        const damagedStructures = this.room.getStructures().sort((structureA, structureB) => {
          return (structureA.hits / structureA.hitsMax) - (structureB.hits / structureB.hitsMax);
        });

        if (damagedStructures.length) {
          this.memory.target = damagedStructures[0].id;
        }
      }
    }
  }

  shouldBeRecycled() {
    return this.room.getConstructionSites().length < 1;
  }
}
