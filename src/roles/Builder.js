import Base from './Base';

export default class Builder extends Base {
  static role = 'builder'

  energySources() {
    return [
      ...this.room.getControllerLinks(),
      ...[this.room.getStorage()],
    ].filter(Boolean);
  }

  performRole() {
    if (this.isEmpty()) {
      return this.gatherEnergy();
    }
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

  shouldBeRecycled() {
    return this.room.getConstructionSites().length < 1;
  }

  needsEnergy() {
    return this.isEmpty();
  }
}
