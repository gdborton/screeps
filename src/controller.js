Object.assign(StructureController.prototype, {
  placeFlags() {
    const buildAblePositions = [...this.pos.buildablePositionsAtRange(2)];
    const dropSpot = buildAblePositions.find(pos => {
      return pos.x === this.pos.x || pos.y === this.pos.y;
    }) || buildAblePositions[0];
    this.room.placeFlag(dropSpot, 'CONTROLLER_ENERGY_DROP');
    buildAblePositions.splice(buildAblePositions.indexOf(dropSpot), 1);
    buildAblePositions.sort((positionA, positionB) => {
      const positionADistance = positionA.getRangeTo(dropSpot);
      const positionBDistance = positionB.getRangeTo(dropSpot);
      return positionADistance - positionBDistance;
    });
    this.room.createBuildFlag(buildAblePositions[0], STRUCTURE_LINK);
  },
});
