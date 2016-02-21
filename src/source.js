Object.assign(Source.prototype, {
  // Finds and returns the number of open spots next to the source.
  freeEdges() {
    return this.pos.freeEdges();
  },

  needsHarvesters() {
    const harvesters = this.room.getHarvesters();
    let myHarvesters = 0;
    let workParts = 0;
    harvesters.forEach(harvester => {
      if (harvester.memory.source === this.id) {
        myHarvesters++;
        workParts = workParts + harvester.body.filter(bodyPart => {
          return bodyPart.type === 'work';
        }).length;
      }
    });

    return workParts < 5 && myHarvesters < this.freeEdges();
  },
});
