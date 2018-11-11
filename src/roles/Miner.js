import Base from './Base';

export default class extends Base {
  static role = 'miner'

  performRole() {
    const source = this.targetSource();
    const container = this.room.getContainers().find((container) => {
      return container.pos.getRangeTo(source) === 1;
    });

    if (this.pos.getRangeTo(container)) {
      return this.moveTo(container);
    }
    return this.moveToAndHarvest(source);
  }

  static createCreepForSpawn(spawn) {
    const miners = spawn.room.getCreepsWithRole(this.role);
    const sources = spawn.room.getSources();
    if (spawn.room.hasContainersConfigured() && miners.length < sources.length) {
      return sources.reduce((prev, source) => {
        if (prev || miners.find(miner => miner.memory.target === prev.id)) return prev;
        return {
          memory: {
            role: this.role,
            target: source.id,
          },
          body: [
            MOVE, MOVE, MOVE,
            WORK, WORK, WORK, WORK, WORK,
          ]
        };
      }, undefined);
    }
    return undefined;
  }
}
