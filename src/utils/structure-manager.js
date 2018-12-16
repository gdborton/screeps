import structureMap from '../utils/structure-map';

function enhanceStructure(structure) {
  const Constructor = structureMap[structure.structureType];
  if (Constructor) {
    return new Constructor(structure.id);
  }
  return structure;
}

function convertStructures() {
  return Object.entries(Game.rooms).reduce((prevStructures, [roomName, room]) => {
    return [
      ...prevStructures,
      ...room.find(FIND_STRUCTURES).map(enhanceStructure),
    ];
  }, []);
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
