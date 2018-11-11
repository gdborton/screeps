import './_base';

export default class Tower extends StructureTower {
  performRole() {
    if (this.room.hasHostileCreeps() && !this.isEmpty()) {
      this.attack(this.pos.findClosestByRange(this.room.getHostileCreeps()));
    }
  }
}
