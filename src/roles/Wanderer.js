import Base from './Base';

// Wanderer wanders aimlessly in an attempt to generate a value for each room in the world.
export default class Wanderer extends Base {
  performRole() {
    const target = this.aquireTarget();
    const result = this.moveTo(target);
    if (result !== 0) { // couldn't move, doesn't matter the reason.
      this.memory.targetExit = undefined;
    }
  }

  aquireTarget() {
    if (!this.memory.targetExit || this.memory.targetExit.room !== this.room.name) {
      this.room.attemptReserve(); // we're in a new room, attempt to reserve.
      const targetExit = [...this.room.getUniqueExitPoints()].sort(() => { // return a random exit.
        return Math.floor(Math.random() * 3) - 1;
      })[0];
      this.memory.targetExit = {
        room: this.room.name,
        x: targetExit.x,
        y: targetExit.y,
      };
    }
    const targetExit = this.memory.targetExit;
    return new RoomPosition(targetExit.x, targetExit.y, targetExit.room);
  }
}
