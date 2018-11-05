/* @flow */
import { Source } from 'screeps-globals';

Object.assign(Source.prototype, {
  // Finds and returns the number of open spots next to the source.
  freeEdges() {
    return this.pos.freeEdges();
  },

  needsHarvesters() {
    const harvesters = this.room.myCreeps();
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

  hasContainer() {
    return !!this.room.getContainers().find(container => container.pos.getRangeTo(this) === 1);
  },

  hasTowerFlag() {
    return !!this.room.getTowerFlags().find(flag => {
      return flag.pos.getRangeTo(this.pos) < 3;
    });
  },

  getBuildablePositions() {
    const range2Positions = this.pos.buildablePositionsAtRange(2);
    const range1Positions = this.pos.buildablePositionsAtRange();
    return range2Positions.filter(position => {
      return !!range1Positions.find(range1Position => {
        return range1Position.getRangeTo(position) === 1;
      });
    });
  },

  placeFlags() {
    const buildablePositions = this.getBuildablePositions().sort((positionA, positionB) => {
      return this.pos.actualDistanceTo(positionA) - this.pos.actualDistanceTo(positionB);
    });
    buildablePositions.pop(); // leave the last position as a walkway.

    buildablePositions.forEach((position, index) => {
      if (index === 0) {
        this.room.placeLinkFlag(position);
      } else if (index === 1 && this.isNearestToController()) {
        this.room.placeStorageFlag(position);
      } else {
        this.room.placeTowerFlag(position);
      }
    });
  },

  isNearestToController() {
    if (this._isNearestToController === undefined) {
      const sources = [...this.room.getSources()].sort((sourceA, sourceB) => {
        const sourceARange = sourceA.pos.getRangeTo(this.room.controller.pos);
        const sourceBRange = sourceB.pos.getRangeTo(this.room.controller.pos);
        return sourceARange - sourceBRange;
      });
      this._isNearestToController = this === sources[0];
    }

    return this._isNearestToController;
  },
});
