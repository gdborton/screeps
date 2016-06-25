import './_base';

const REPAIR_TO = 10000000; // ten million
const TOWER_REPAIR_TO = 1000000; // one million

export default class Rampart extends StructureRampart {
  // Ramparts don't do any work yet.  Maybe in the future they'll unlock for allies.
  work() {}

  needsRepaired() {
    return this.hits < REPAIR_TO && this.hits / this.hitsMax < 0.9;
  }

  needsTowerRepaired() {
    return this.hits < TOWER_REPAIR_TO;
  }
}
