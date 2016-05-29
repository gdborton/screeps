import structureMap from './utils/structure-map';

function convertStructures() {
  return Object.keys(Game.structures).map(structureId => {
    const structure = Game.structures[structureId];
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
