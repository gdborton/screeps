import Base from './Base';

export default class extends Base {
  static role = 'miner';

  static body = [
    MOVE,
    WORK, WORK, WORK, WORK, WORK,
  ];

  static createCreepFor(spawn) {
    const creeps = spawn.room.myCreeps();
    const miners = spawn.room.getCreepsWithRole(this.role);
    const sources = spawn.room.getSources();
    // if we're the only creep, don't build another one.
    if (miners === 1 && creeps === 1) {
      return undefined;
    }
    if (spawn.room.hasContainersConfigured() && miners.length < sources.length) {
      const source = sources.find((source) => {
        return !miners.find(miner => miner.memory.source === source.id);
      });
      return {
        memory: {
          role: this.role,
          source: source.id,
        },
        body: this.body,
      };
    }
    return undefined;
  }

  performRole() {
    const source = this.targetSource();
    const container = this.room.getContainers().find((container) => {
      return container.pos.getRangeTo(source) === 1;
    });

    if (container && this.pos.getRangeTo(container) > 0) {
      return this.moveTo(container);
    }
    return this.moveToAndHarvest(source);
  }
}
