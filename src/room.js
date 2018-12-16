/* @flow */
import { Room } from 'screeps-globals';
import creepManager from './utils/creep-manager';
import structureManager from './utils/structure-manager';
import { LOOK_STRUCTURES, STRUCTURE_LINK } from './utils/constants';

const MIN_RESERVE_LEVEL = 6;

//#region Old way of writing roles
function getAllScoutHarvesters() {
  return creepManager.creeps().filter(creep => {
    return creep.memory.role === 'scoutharvester' || creep.memory.oldRole === 'scoutharvester';
  });
}

function getAllScouts() {
  return creepManager.creepsWithRole('scout');
}

function getAllAttackers() {
  return creepManager.creepsWithRole('attacker');
}
//#endregion

const cardinality = {
  N: -1,
  S: 1,
  W: -1,
  E: 1,
};

function coordValue(roomName, regex) {
  const xString = regex.exec(roomName)[1];
  const modifier = cardinality[xString.substr(0, 1)];
  const value = xString.substr(1);
  return modifier * value;
}

function xValueFromRoomName(roomName) {
  return coordValue(roomName, /([WE]\d+)/);
}

function yValueFromRoomName(roomName) {
  return coordValue(roomName, /([NS]\d+)/);
}

Object.assign(Room.prototype, {
  work() {
    this.getMyStructures().forEach((structure) => {
      structure.work();
    });

    this.myCreeps().forEach((creep) => {
      creep.work();
    });

    this.getFlags().forEach((flag) => {
      flag.work();
    });

    this.determineSourceLinkSites().forEach(this.placeLinkFlag, this);
    this.determineSourceSpawnLocations().forEach(this.placeSpawnFlag, this);
    this.determineContainerSites().forEach(this.placeContainerFlag, this);
    this.determineTowerSites().forEach(this.placeTowerFlag, this);

    if (this.getSpawns().length) {
      this.determineRoadSites().forEach(this.placeRoadFlag, this);
      this.determineControllerLinkLocations().forEach(this.placeLinkFlag, this);
    }
  },

  hasDirectExitTo(roomName) {
    const targetX = xValueFromRoomName(roomName);
    const targetY = yValueFromRoomName(roomName);
    const x = this.getXCoord();
    const y = this.getYCoord();
    if (this.distanceToRoom(roomName) > 1) {
      return null;
    }

    if (x < targetX) {
      return this.hasEastExit();
    } else if (x > targetX) {
      return this.hasWestExit();
    } else if (y < targetY) {
      return this.hasSouthExit();
    }

    return this.hasNorthExit();
  },

  hasEastExit() {
    return !!this.getUniqueExitPoints().find(exitPos => exitPos.x === 49);
  },

  hasWestExit() {
    return !!this.getUniqueExitPoints().find(exitPos => exitPos.x === 0);
  },

  hasNorthExit() {
    return !!this.getUniqueExitPoints().find(exitPos => exitPos.y === 0);
  },

  hasSouthExit() {
    return !!this.getUniqueExitPoints().find(exitPos => exitPos.y === 49);
  },

  hasHostileCreeps() {
    return this.getHostileCreeps().length > 0;
  },

  // roomName needs to be a string because we may not have access to the room object on Game.rooms.
  distanceToRoom(roomName) {
    const xDistance = this.getXCoord() - xValueFromRoomName(roomName);
    const yDistance = this.getYCoord() - yValueFromRoomName(roomName);
    const distance = xDistance * xDistance + yDistance * yDistance;
    return Math.sqrt(distance);
  },

  isClosestToRoom(roomName) {
    return Game.getClosestOwnedRoomTo(roomName);
  },

  getXCoord() {
    return xValueFromRoomName(this.name);
  },

  getYCoord() {
    return yValueFromRoomName(this.name);
  },

  needsAttackers() {
    return getAllAttackers().length < 2;
  },

  placeStructures() {
    if (this.needsObserver()) {
      this.buildObserver();
    }

    if (this.needsExtractor()) {
      this.buildExtractor();
    }

    if (this.needsTerminal()) {
      this.buildTerminal();
    }
  },

  buildRoadAt(x, y) {
    this._buildRoadAtCalls = this._buildRoadAtCalls || 0;
    if (this._buildRoadAtCalls < 5 && this.getConstructionSites().length < 5) {
      if (this.createConstructionSite(x, y, STRUCTURE_ROAD) === 0) {
        this._buildRoadAtCalls++;
      }
    }
  },

  getHostileCreeps() {
    return this.find(FIND_HOSTILE_CREEPS);
  },

  needsObserver() {
    return this.controller.level >= 8 && !this.getObserver();
  },

  needsExtractor() {
    return this.controller.level >= 6 && !this.getExtractor();
  },

  needsTerminal() {
    return this.controller.level >= 6 && !this.getTerminal();
  },

  buildObserver() {
    const spawn = this.getSpawns()[0];
    if (spawn) {
      this.createConstructionSite(spawn.pos.x + 1, spawn.pos.y + 1, STRUCTURE_OBSERVER);
    }
  },

  buildExtractor() {
    this.getMineralSites().forEach(mineral => {
      this.createConstructionSite(mineral.pos.x, mineral.pos.y, STRUCTURE_EXTRACTOR);
    });
  },

  buildTerminal() {
    const spawn = this.getSpawns[0];
    if (spawn) {
      this.createConstructionSite(spawn.pos.x - 2, spawn.pos.y + 2, STRUCTURE_TERMINAL);
    }
  },

  needsUpgraders() {
    const hasFreeEdges = this.upgraderCount() < this.controller.pos.freeEdges();
    return hasFreeEdges &&
      this.upgraderWorkParts() < this.maxEnergyProducedPerTick() &&
      !this.getConstructionSites().length;
  },

  clearConstructionSites() {
    this.getConstructionSites().forEach(constructionSite => {
      constructionSite.remove();
    });
  },

  needsBuilders() {
    return this.builderCount() < 1 && this.getConstructionSites().length > 0;
  },

  damagedBuildings() {
    return this.getStructures().filter(structure => {
      return structure.structureType !== STRUCTURE_ROAD && structure.needsRepaired();
    });
  },

  getStorage() {
    if (!this._storageCalc) {
      this._storageCalc = true;
      this._storage = this.getMyStructures().filter(structure => {
        return structure.structureType === STRUCTURE_STORAGE;
      })[0];
    }
    return this._storage;
  },

  hasTowers() {
    return this.getTowers().length > 0;
  },

  getTowers() {
    if (!this._towers) {
      this._towers = this.getMyStructures().filter(structure => {
        return structure.structureType === STRUCTURE_TOWER;
      });
    }
    return this._towers;
  },

  getContainers() {
    if (!this._containers) {
      this._containers = this.getStructures().filter(structure => {
        return structure.structureType === STRUCTURE_CONTAINER;
      });
    }
    return this._containers;
  },

  getObserver() {
    if (!this._observerCalc) {
      this._observerCalc = true;
      this._observer = this.getMyStructures().filter(structure => {
        return structure.structureType === STRUCTURE_OBSERVER;
      })[0];
    }

    return this._observer;
  },

  getMineralSites() {
    if (!this._minerals) {
      this._minerals = this.find(FIND_MINERALS);
    }
    return this._minerals;
  },

  getExtractor() {
    if (!this._extractorCalc) {
      this._extractorCalc = true;
      this._extractor = this.getMyStructures().filter(structure => {
        return structure.structureType === STRUCTURE_EXTRACTOR;
      })[0];
    }

    return this._extractor;
  },

  getTerminal() {
    if (!this._terminalCalc) {
      this._termainalCalc = true;
      this._terminal = this.getMyStructures().filter(structure => {
        return structure.structureType === STRUCTURE_TERMINAL;
      })[0];
    }
    return this._terminal;
  },

  placeFlags() {
    if (this.controller) {
      this.controller.placeFlags();
    }
    this.placeConstructionFlags();
  },

  placeConstructionFlags() {
    this.placeWallFlags();
  },

  placeStorageFlag(pos) {
    this.createBuildFlag(pos, STRUCTURE_STORAGE);
  },

  placeLinkFlag(pos) {
    this.createBuildFlag(pos, STRUCTURE_LINK);
  },

  placeRoadFlag(pos) {
    this.createBuildFlag(pos, STRUCTURE_ROAD);
  },

  placeSpawnFlag(pos) {
    this.createBuildFlag(pos, STRUCTURE_SPAWN);
  },

  placeTowerFlag(pos) {
    this.createBuildFlag(pos, STRUCTURE_TOWER);
  },

  placeContainerFlag(pos) {
    this.createBuildFlag(pos, STRUCTURE_CONTAINER);
  },

  placeWallFlags() {
    if (this.hasTowers()) {
      const exits = this.getExits();
      exits.forEach(exitPos => {
        const potentialSpots = exitPos.openPositionsAtRange(2);
        const realSpots = potentialSpots.filter(potentialSpot => {
          let shouldBuild = true;
          exits.forEach(exit => {
            if (exit.getRangeTo(potentialSpot) < 2) {
              shouldBuild = false;
            }
          });
          return shouldBuild;
        });
        realSpots.forEach(realSpot => {
          this.createBuildFlag(realSpot, STRUCTURE_WALL);
        });
      });
    }
  },

  createBuildFlag(pos, structureType) {
    const existingStructures = [
      ...pos.lookFor(LOOK_STRUCTURES),
      ...pos.lookFor(LOOK_CONSTRUCTION_SITES)
    ];
    const alreadyHasStructure = existingStructures.find(structure => {
      return structure.structureType === structureType || structureType === STRUCTURE_ROAD;
    });

    if (alreadyHasStructure) {
      return undefined;
    } else if (existingStructures.length === 0 || (existingStructures.length === 1 && existingStructures[0].structureType === STRUCTURE_ROAD)) {
      return this.placeFlag(pos, `BUILD_${structureType}`);
    }

    return this.placeFlag(pos, `here?_${structureType}`);
  },

  placeFlag(pos, name) {
    this.createFlag(pos, `${name}_${this.name}_x${pos.x}_y${pos.y}`);
  },

  getTowerFlags() {
    return this.getFlags().filter(flag => {
      return flag.name.indexOf(STRUCTURE_TOWER) !== -1;
    });
  },

  getLinks() {
    if (!this._links) {
      this._links = this.getMyStructures().filter(structure => {
        return structure.structureType === STRUCTURE_LINK;
      });
    }

    return this._links;
  },

  upgraderWorkParts() {
    if (!this._upgraderWorkParts) {
      let parts = this.getUpgraders();
      parts = parts.map(upgrader => {
        return upgrader.body.filter(bodyPart => {
          return bodyPart.type === WORK;
        }).length;
      });

      if (parts.length) {
        this._upgraderWorkParts = parts.reduce((a, b) => { return a + b; });
      } else {
        this._upgraderWorkParts = 0;
      }
    }

    return this._upgraderWorkParts;
  },

  maxEnergyProducedPerTick() {
    return this.sourceCount() * 10;
  },

  sourceCount() {
    return this.getSources().length;
  },

  getMyStructures() {
    if (!this._myStructures) {
      const structures = this.getStructures();
      this._myStructures = structures.filter(structure => structure.my);
    }

    return this._myStructures;
  },

  getStructures() {
    if (!this._structures) {
      const structures = structureManager.structures();
      this._structures = structures.filter(structure => structure.room === this);
    }
    return this._structures;
  },

  getRoads() {
    if (!this._roads) {
      this._roads = this.getStructures().filter(structure => {
        return structure.structureType === STRUCTURE_ROAD;
      });
    }

    return this._roads;
  },

  getDamagedRoads() {
    if (!this._damagedRoads) {
      this._damagedRoads = this.getRoads().filter(road => {
        return road.structureType === STRUCTURE_ROAD && road.hits / road.hitsMax < 0.5;
      });
    }

    return this._damagedRoads;
  },

  hasDamagedRoads() {
    return this.getDamagedRoads().length > 0;
  },

  placeReserveFlag() {
    this.placeFlag(this.getCenterPosition(), 'reserve');
  },

  getClaimFlags() {
    return this.getFlags().filter(flag => {
      return flag.name.includes('claim');
    });
  },

  shouldClaim() {
    const claimFlags = this.getClaimFlags();
    return claimFlags.length === 0 && this.controller && !this.controller.owner && !this.controller.reservation;
  },

  placeClaimFlag() {
    this.placeFlag(this.getCenterPosition(), 'claim');
  },

  attemptReserve() {
    if (this.shouldClaim()) {
      return this.placeClaimFlag();
    } else if (this.shouldReserve()) {
      return this.placeReserveFlag();
    }
  },

  shouldReserve() {
    const hasController = this.controller;
    const ownNearbyRoom = Game.myRooms().find(room => {
      const isNextTo = room.distanceToRoom(this.name) === 1;
      return isNextTo &&
        room.ableToReserve() &&
        this.hasDirectExitTo(room.name);
    });

    return hasController && !this.getSpawns().length && !!ownNearbyRoom;
  },

  getCreepsWithRole(role) {
    if (!this._creepsWithRole) {
      this._creepsWithRole = this.myCreeps().reduce((acc, creep) => {
        if (!acc[creep.memory.role]) acc[creep.memory.role] = [];
        acc[creep.memory.role].push(creep);
        return acc;
      }, {});
    }
    return this._creepsWithRole[role] || [];
  },

  getReservers() {
    return creepManager.creepsWithRole('reserver').filter(creep => creep.memory.room === this.name);
  },

  getReserverCount() {
    return this.getReservers().length;
  },

  ableToReserve() {
    return this.getControllerOwned() && this.controller.level >= MIN_RESERVE_LEVEL;
  },

  getReserveFlags() {
    return Game.flagArray().filter(flag => {
      return flag.isReserveFlag() && this.distanceToRoom(flag.pos.roomName) === 1;
    });
  },

  getReserveFlagsNeedingReservers() {
    return this.getReserveFlags().filter(flag => flag.needsReserver());
  },

  getReserveFlagsNeedingRemoteCouriers() {
    return this.getReserveFlags().filter(flag => flag.needsRemoteCouriers());
  },

  getReserveFlagsNeedingRemoteHarvesters() {
    return this.getReserveFlags().filter(flag => flag.needsRemoteHarvesters());
  },

  needsRemoteHarvesters() {
    return this.getReserveFlagsNeedingRemoteHarvesters().length > 0;
  },

  needsRemoteCouriers() {
    return this.getReserveFlagsNeedingRemoteCouriers().length > 0;
  },

  needsReservers() {
    const meetsLevel = this.controller.level >= MIN_RESERVE_LEVEL;
    const flagsNeedingReservers = this.getReserveFlagsNeedingReservers();
    return meetsLevel && flagsNeedingReservers.length && this.getReserverCount() < 1;
  },

  needsCouriers() {
    if (this.hasLinksConfigured()) return false;
    if (this.courierCount() === 1 && this.getCouriers()[0].ticksToLive < 70) {
      return true;
    }

    const storage = this.getStorage();
    if (!storage) {
      return this.courierCount() < 2;
    } else if (storage.store.energy > 500000) {
      return this.courierCount() < Math.floor(storage.store.energy / 200000);
    }

    return this.courierCount() < 1;
  },

  getExits() {
    if (!this._exits) {
      this._exits = this.find(FIND_EXIT);
    }

    return this._exits;
  },

  getUniqueExitPoints() {
    if (!this._uniqueExitPoints) {
      const exitCoords = this.getExits();
      this._uniqueExitPoints = exitCoords.filter((coord, index) => {
        if (index === 0) {
          return true;
        }

        const prevCoord = exitCoords[index - 1];
        return !(Math.abs(coord.x - prevCoord.x) < 2) || !(Math.abs(coord.y - prevCoord.y) < 2);
      });
    }

    return this._uniqueExitPoints;
  },

  getFlags() {
    return this.find(FIND_FLAGS).filter(flag => {
      return flag.room === this;
    });
  },

  getControllerEnergyDropFlag() {
    return this.getFlags().filter(flag => {
      return flag.name.indexOf('CONTROLLER_ENERGY_DROP') !== -1;
    })[0];
  },

  courierCount() {
    return this.getCouriers().length;
  },

  getCouriers() {
    if (!this._couriers) {
      this._couriers = this.myCreeps().filter((creep) => {
        return creep.memory.role === 'courier';
      });
    }

    return this._couriers;
  },

  myCreeps() {
    if (!this._myCreeps) {
      this._myCreeps = creepManager.creeps().filter(creep => creep.room === this);
    }

    return this._myCreeps;
  },

  builderCount() {
    return this.getBuilders().length;
  },

  getBuilders() {
    if (!this._builders) {
      this._builders = this.myCreeps().filter((creep) => {
        return creep.memory.role === 'builder';
      });
    }

    return this._builders;
  },

  upgraderCount() {
    return this.getUpgraders().length;
  },

  getUpgraders() {
    if (!this._upgraders) {
      this._upgraders = this.myCreeps().filter(creep => {
        return creep.memory.role === 'upgrader';
      });
    }
    return this._upgraders;
  },

  getConstructionSites() {
    return this.find(FIND_CONSTRUCTION_SITES);
  },

  getSources() {
    if (!this._sources) {
      this._sources = this.find(FIND_SOURCES);
    }

    return this._sources;
  },

  getEnergySourceStructures() {
    return this.getMyStructures().filter(structure => {
      return structure.energy;
    });
  },

  droppedControllerEnergy() {
    if (!this._droppedControllerEnergy) {
      const dumpFlag = this.getControllerEnergyDropFlag();
      this._droppedControllerEnergy = this.find(FIND_DROPPED_RESOURCES).filter(energy => {
        return energy.pos.getRangeTo(dumpFlag) === 0;
      })[0];
    }

    return this._droppedControllerEnergy;
  },

  getEnergyStockSources() {
    if (!this._energyStockSources) {
      const droppedControllerEnergy = this.droppedControllerEnergy();
      this._energyStockSources = this.getEnergySourceStructures();
      if (droppedControllerEnergy) {
        this._energyStockSources.unshift(droppedControllerEnergy);
      }
    }

    return this._energyStockSources;
  },

  getSpawns() {
    return this.find(FIND_MY_SPAWNS);
  },

  canBuildExtension() {
    if (this._canBuildExtensions === undefined) {
      const maxExtensions = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][this.controller.level] || 0;
      this._canBuildExtensions = this.getExtensions().length < maxExtensions;
    }
    return this._canBuildExtensions;
  },

  getExtensions() {
    if (!this._extensions) {
      this._extensions = this.getMyStructures().filter(structure => {
        return structure.structureType === STRUCTURE_EXTENSION;
      });
    }

    return this._extensions;
  },

  getHostileStructures() {
    return this.getStructures().filter(structure => structure.owner && !structure.my);
  },

  courierTargets() {
    return this.getCouriers().filter(creep => {
      return creep.memory.role === 'courier' && !!creep.memory.target;
    }).map(courier => {
      return courier.memory.target;
    });
  },

  getDroppedEnergy() {
    return this.find(FIND_DROPPED_RESOURCES).sort((energyA, energyB) => {
      return energyB.energy - energyA.energy;
    });
  },

  getEnergyThatNeedsPickedUp() {
    const targets = this.courierTargets();
    const dumpFlag = this.getControllerEnergyDropFlag();

    return this.getDroppedEnergy().filter(energy => {
      const targeted = targets.indexOf(energy.id) !== -1;
      const inRange = energy.pos.getRangeTo(this.getCenterPosition()) < 23;
      return !targeted && inRange && energy.pos.getRangeTo(dumpFlag) !== 0;
    });
  },

  getCenterPosition() {
    return new RoomPosition(25, 25, this.name);
  },

  getControllerOwned() {
    return this.controller && this.controller.my;
  },

  getDismantleFlag() {
    return Game.dismantleFlags().filter((flag) => {
      return flag.room === this;
    })[0];
  },

  getStructureAt(roomPosition) {
    return this.getStructures().filter((structure) => {
      return structure.pos.getRangeTo(roomPosition) === 0;
    })[0];
  },

  hasScoutFlag() {
    return Game.getScoutFlags().filter((flag) => {
      return flag.room === this;
    }).length > 0;
  },

  needsScouts() {
    let desiredValue = 2;
    if (Game.dismantleFlags().length > 0) {
      desiredValue = 4;
    }
    return this.hasScoutFlag() && getAllScouts().length < desiredValue;
  },

  needsScoutHarvesters() {
    let desiredValue = 2;
    if (Game.dismantleFlags().length > 0) {
      desiredValue = 0;
    }
    return this.hasScoutFlag() && getAllScoutHarvesters().length < desiredValue;
  },

  getSpawnStructures() {
    return [
      ...this.getExtensions(),
      ...this.getSpawns(),
    ]
  },

  getStructuresNeedingEnergy() {
    if (!this._structuresNeedingEnergyDelivery) {
      this._structuresNeedingEnergyDelivery = this.getMyStructures().filter(structure => {
        return structure.needsEnergy();
      });
    }
    return this._structuresNeedingEnergyDelivery;
  },

  getEnergySourcesThatNeedsStocked() {
    if (this.getEnergyThatNeedsPickedUp().length) {
      return this.getEnergyThatNeedsPickedUp();
    } else if (this.getContainers().length) {
      return this.getContainers().filter(container => !container.isEmpty());
    } else if (this.getStorage() && !this.getStorage().isEmpty()) {
      return [this.getStorage()];
    } else if (this.hasTowers()) {
      // All towers that aren't empty are a source of energy
      return this.getTowers().filter(tower => {
        return !tower.isEmpty();
      });
    }

    return [];
  },

  determineBuildSites() {
    const containerSites = this.determineContainerSites();

    return {
      containerSites,
      linkSites: this.determineLinkSites(),
      towerSites: this.determineTowerSites(),
      storageSite: this.determineStorageSite(),
    };
  },

  determineContainerSites() {
    if (!this._containerSites) {
      const sources = this.getSources();
      this._containerSites = sources.map((source) => {
        let target = this.controller;
        if (sources.length > 1) {
          target =  sources.find(potentialTarget => potentialTarget !== source);
        }
        return this.mapPathToPosition(source.pos.findOptimalPathTo(target))[0];
      }).filter(Boolean);
    }

    return this._containerSites;
  },

  mapPathToPosition(path) {
    return path.map(pathPos => {
      return new RoomPosition(pathPos.x, pathPos.y, this.name);
    });
  },

  findPositionsInPathToNearestSpawn(target, onlyTerrain) {
    return this.mapPathToPosition(this.findPathToNearestSpawn(target, onlyTerrain));
  },

  hasLinksConfigured() {
    return this.getLinks().length >= 2;
  },

  determineLinkSites() {
    return [
      ...this.determineSourceLinkSites(),
      ...this.determineControllerLinkLocations(),
    ];
  },

  hasContainersConfigured() {
    return this.getContainers().length === this.getSources().length;
  },

  findPathToNearestSpawn(target) {
    let nearestPath;
    this.getSpawns().forEach((spawn) => {
      const path = target.pos.findOptimalPathTo(spawn);
      if (!nearestPath || nearestPath.length > path.length) {
        nearestPath = path;
      }
    });

    return nearestPath;
  },

  determineTransferPostions() {

  },

  determineStorageSite() {
    if (!this.controller) return undefined;
    const controllerPathPositions = this.findPositionsInPathToNearestSpawn(this.controller, true);
    const transferPosition = controllerPathPositions[2];
    return transferPosition.buildablePositionsAtRange(1).filter((position) => {
      return !controllerPathPositions.find(pathPos => pathPos.isEqualTo(position));
    })[0];
  },

  determineControllerLinkLocations() {
    if (!this._locations) {
      this._locations = [];
      if (this.controller) {
        const pathPositions = this.findPositionsInPathToNearestSpawn(this.controller, true);
        if (pathPositions.length > 3) {
          this._locations = [pathPositions[3]];
        }
      }
    }
    return this._locations;
  },

  getControllerLinks() {
    return this.determineControllerLinkLocations().map((controllerLinkPos) => {
      const structures = controllerLinkPos.lookFor(LOOK_STRUCTURES);
      return structures.find(structure => structure.structureType === STRUCTURE_LINK);
    }).filter(Boolean);
  },

  killAllCreeps() {
    this.myCreeps().forEach(creep => creep.suicide());
  },

  determineSourceLinkSites() {
    const sources = this.getSources();
    if (!(this.controller && this.controller.my)) return [];

    return sources.map((source) => {
      let target = this.controller;
      if (sources.length > 1) {
        target =  sources.find(potentialTarget => potentialTarget !== source);
      }
      const pathPositions = this.mapPathToPosition(source.pos.findOptimalPathTo(target));
      const transferLocation = pathPositions[1];
      return transferLocation.buildablePositionsAtRange(1).filter(position => {
        return !pathPositions.find(pathPos => pathPos.isEqualTo(position));
      })[0];
    });
  },

  determineSourceSpawnLocations() {
    const sources = this.getSources();
    if (!(this.controller && this.controller.my)) return [];

    return sources.map((source) => {
      let target = this.controller;
      if (sources.length > 1) {
        target =  sources.find(potentialTarget => potentialTarget !== source);
      }
      const pathPositions = this.mapPathToPosition(source.pos.findOptimalPathTo(target));
      const transferLocation = pathPositions[1];
      return transferLocation.buildablePositionsAtRange(1).filter(position => {
        return !pathPositions.find(pathPos => pathPos.isEqualTo(position));
      })[1];
    });
  },

  determineTowerSites() {
    const sources = this.getSources();
    if (!(this.controller && this.controller.my)) return [];

    return sources.map((source) => {
      let target = this.controller;
      if (sources.length > 1) {
        target =  sources.find(potentialTarget => potentialTarget !== source);
      }
      const pathPositions = this.mapPathToPosition(source.pos.findOptimalPathTo(target));
      const transferLocation = pathPositions[1];
      return transferLocation.buildablePositionsAtRange(1).filter(position => {
        return !pathPositions.find(pathPos => pathPos.isEqualTo(position));
      })[2];
    });
  },

  determineRoadSites() {
    if (this.controller && this.controller.my) {
      const closestSource = this.controller.pos.findClosestByRange(this.getSources());
      const pathToClosestSource = this.controller.pos.findOptimalPathTo(closestSource);
      const path = [
        ...this.getSources().reduce((acc, source) => {
          const optimalPath = source.pos.findOptimalPathTo(closestSource);
          return [
            ...acc,
            ...optimalPath.slice(0, optimalPath.length - 1),
          ];
        }, []),
        ...pathToClosestSource.slice(0, pathToClosestSource.length - 1),
      ];
      return this.mapPathToPosition(path);
    }

    return [];
  },
});
