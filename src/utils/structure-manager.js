import structureMap from '../utils/structure-map';

function convertStructures() {
  const normalStructures = [];
  Object.keys(Game.rooms).forEach(roomName => {
    const room = Game.rooms[roomName];
    Array.prototype.push.apply(normalStructures, room.find(FIND_STRUCTURES));
  });

  return normalStructures.map(structure => {
    const Constructor = structureMap[structure.structureType];
    if (Constructor) {
      return new Constructor(structure.id);
    }
    return structure;
  });
}

class StructureManager {
  structures() {
    return convertStructures();
  }
}

const structureManager = new StructureManager();
export default structureManager;
