import Base from './Base';
import creepManager from '../utils/creep-manager';

export default class Bootstrapper extends Base {
  static role = 'bootstrapper'
  static createCreepFor(spawn) {
    const allBootstrappers = creepManager.creepsWithRole(this.role);
    const roomsWithoutSpawns = Game.roomArray().filter((room) => {
      return room.controller && room.controller.my && room.getSpawns().length === 0;
    });
    const roomNeedingBootstrapper = roomsWithoutSpawns.find(roomWithoutSpawn => {
      const bootstrappersServingRoom = allBootstrappers.filter(bootstrapper => {
        return bootstrapper.memory.target === roomWithoutSpawn.name;
      });
      let bootstrappersNeededForRoom = roomWithoutSpawn.controller.pos.findClosestByRange(roomWithoutSpawn.getSources()).freeEdges();
      bootstrappersNeededForRoom = Math.min(2, bootstrappersNeededForRoom);
      return bootstrappersServingRoom.length < bootstrappersNeededForRoom;
    });
    if (roomNeedingBootstrapper) {
      return {
        memory: {
          role: this.role,
          target: roomNeedingBootstrapper.name,
        },
        body: [
          WORK, WORK, WORK,
          MOVE, MOVE, MOVE,
          CARRY
        ],
      };
    }
  }

  performRole() {
    const room = Game.rooms[this.memory.target];
    const constructionSites = room.getConstructionSites();
    const sources = room.getSources();
    const hostileStructures = room.getHostileStructures();

    if (hostileStructures.length) {
      return this.moveToAndDismantle(hostileStructures[0]);
    }
    if (this.isEmpty()) {
      this.memory.task = 'gather';
    } else if (this.isFull()) {
      this.memory.task = 'build';
    }
    if (this.memory.task === 'gather') {
      const targetSource = room.controller.pos.findClosestByRange(sources);
      return this.moveToAndHarvest(targetSource);
    }
    return this.moveToAndBuild(this.pos.findClosestByRange(constructionSites));
  }
}