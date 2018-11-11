import Base from './Base';

export default class Builder extends Base {
  performRole() {
    if (this.carry.energy === this.carryCapacity) {
      this.memory.task = 'work';
    } else if (this.carry.energy === 0 || this.memory.task === 'stockup') {
      this.memory.target = null;
      this.memory.task = 'stockup';
      const constrollerLink = this.room.getControllerLink();
      const storage = this.room.getStorage();
      const sources = [
        ...[constrollerLink && !constrollerLink.isEmpty() ? constrollerLink : undefined],
        ...[storage && !storage.isEmpty() ? storage : undefined],
      ].filter(Boolean);

      if (sources.length) {
        return this.takeEnergyFrom(this.pos.findClosestByRange(sources));
      }

      const targetContainer = this.room.getContainers().reduce((prev, container) => {
        if (!prev || prev.totalUtilizedCapacity() <= container.totalUtilizedCapacity()) return container;
        return prev;
      }, undefined);

      // if (.length) {
      //   this.takeEnergyFrom(this.room.getDroppedEnergy()[0]);
      // } else if (this.room.getControllerLink() && !this.room.getControllerLink().isEmpty()) {
      //   this.takeEnergyFrom();
      // } else if (this.room.getStorage() && !this.room.getStorage().isEmpty()) {
      //   this.takeEnergyFrom(this.room.getStorage());
      // }
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
