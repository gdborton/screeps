/* @flow */
import { RoomPosition } from 'screeps-globals';

Object.assign(RoomPosition.prototype, {
  identifier() {
    return `${this.roomName}x${this.x}y${this.y}`;
  },

  freeEdges() {
    if (!(Memory.freeEdges && Memory.freeEdges[this.identifier()])) {
      Memory.freeEdges = Memory.freeEdges || {};
      Memory.freeEdges[this.identifier()] = this.openPositionsAtRange().length;
    }

    return Memory.freeEdges[this.identifier()];
  },

  openPositionsAtRange(range = 1) {
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
        if (pos.getRangeTo(this) === range && pos.isOpen()) {
          openPositions.push(pos);
        }
      });
    });
    return openPositions;
  },

  isOpen() {
    const terrain = this.lookFor('terrain');
    const validTerrain = terrain === 'swamp' || terrain === 'plain';
    return validTerrain && !this.hasStructure() && !this.hasConstructionSite();
  },

  hasConstructionSite() {
    if (this._hasConstructionSiteCalced === undefined) {
      this._hasConstructionSiteCalced = true;
      this._hasConstructionSite = this.lookFor('constructionSite');
    }
    return !!this._hasConstructionSite;
  },

  hasStructure() {
    if (this._hasStructureCalced === undefined) {
      this._hasStructureCalced = true;
      this._hasStructure = this.lookFor('structure').length > 0;
    }
    return this._hasStructure;
  },
});
