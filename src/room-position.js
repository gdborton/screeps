/* @flow */
import { RoomPosition } from 'screeps-globals';
import creepManager from './utils/creep-manager';

Object.assign(RoomPosition.prototype, {
  identifier() {
    return `${this.roomName}x${this.x}y${this.y}`;
  },

  actualDistanceTo(pos) {
    return Math.sqrt(Math.pow(this.x - pos.x, 2) + Math.pow(this.y - pos.y, 2));
  },

  freeEdges() {
    if (!(Memory.freeEdges && Memory.freeEdges[this.identifier()])) {
      Memory.freeEdges = Memory.freeEdges || {};
      Memory.freeEdges[this.identifier()] = this.openPositionsAtRange().length;
    }

    return Memory.freeEdges[this.identifier()];
  },

  openPositionsAtRange(range = 1) {
    return this.buildablePositionsAtRange(range).filter(position => {
      return position.isOpen();
    });
  },

  buildablePositionsAtRange(range = 1) {
    const room = Game.rooms[this.roomName];
    const openPositions = [];
    const top = Math.max(this.y - range, 0);
    const bottom = Math.min(this.y + range, 49);
    const left = Math.max(this.x - range, 0);
    const right = Math.min(this.x + range, 49);
    const surroundings = room.lookAtArea(left, top, right, bottom);
    Object.keys(surroundings).forEach(x => {
      Object.keys(surroundings[x]).forEach(y => {
        const pos = new RoomPosition(+x, +y, this.roomName); // The + is for string -> number
        if (pos.getRangeTo(this) === range && pos.isBuildable()) {
          openPositions.push(pos);
        }
      });
    });
    return openPositions;
  },

  isOpen() {
    return this.isBuildable() && !this.hasStructure() && !this.hasConstructionSite();
  },

  isBuildable() {
    const terrain = this.lookFor('terrain');
    return terrain === 'swamp' || terrain === 'plain';
  },

  hasConstructionSite() {
    if (this._hasConstructionSiteCalced === undefined) {
      this._hasConstructionSiteCalced = true;
      this._hasConstructionSite = this.lookFor('constructionSite').length > 0;
    }
    return this._hasConstructionSite;
  },

  hasStructure() {
    if (this._hasStructureCalced === undefined) {
      this._hasStructureCalced = true;
      this._hasStructure = this.lookFor('structure').filter(structure => {
        return structure.structureType !== STRUCTURE_ROAD;
      }).length > 0;
    }
    return this._hasStructure;
  },

  creep() {
    const creep = this.lookFor(LOOK_CREEPS)[0];
    // Found creep will not be enhanced.
    if (creep) {
      return creepManager.enhanceCreep(creep);
    }
    return creep;
  },

  hasRoad() {
    return this.lookFor('structure').filter(structure => {
      return structure.structureType === STRUCTURE_ROAD;
    }).length > 0;
  },
});
