import structureMap from '../utils/structure-map';

function enhanceStructure(structure) {
  const Constructor = structureMap[structure.structureType];
  if (Constructor) {
    return new Constructor(structure.id);
  }
  return structure;
}

function convertStructures() {
  const normalStructures = [];
  Object.keys(Game.rooms).forEach(roomName => {
    const room = Game.rooms[roomName];
    Array.prototype.push.apply(normalStructures, room.find(FIND_STRUCTURES));
  });

  return normalStructures.map(enhanceStructure);
}

class StructureManager {
  structures() {
    return convertStructures();
  }

  enhanceStructure(structure) {
    return enhanceStructure(structure);
  }
}

const structureManager = new StructureManager();
export default structureManager;
