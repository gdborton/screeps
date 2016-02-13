require('room');
var validExitCoord = require('valid-exit-coord');
var bodyCosts = require('body-costs');

var roles = {
  harvester: function() {
    if (this.carry.energy < this.carryCapacity || this.carry.energy === 0) {
      var source = this.targetSource();
      this.moveToAndHarvest(source);
    } else if (this.room.courierCount() === 0 && this.getSpawn().availableEnergy() < 300) {
      this.deliverEnergyTo(this.getSpawn());
    } else {
      var storage = this.room.getStorage();
      var links = this.room.getLinks();
      var closestLink = this.pos.findClosestByRange(links);

      if (storage && storage.store.energy < storage.storeCapacity * 0.3 && this.pos.getRangeTo(storage) === 1) {
        this.deliverEnergyTo(storage);
      } else if (links.length && this.pos.getRangeTo(closestLink) === 1 && !closestLink.isFull()) {
        this.deliverEnergyTo(closestLink);
      } else if (storage && storage.store.energy < storage.storeCapacity && this.pos.getRangeTo(storage) === 1) {
        this.deliverEnergyTo(storage);
      } else {
        this.dropEnergy();
      }
    }
  },

  scoutharvester: function() {
    if (this.findUnvisitedScoutFlags().length > 0) {
      this.scout();
    } else {
      var sourcesNeedingHarvesters = this.room.getSourcesNeedingHarvesters();
      if (sourcesNeedingHarvesters.length > 0) {
        this.memory.role = 'harvester';
        this.memory.oldRole = 'scoutharvester';
        this.memory.source = sourcesNeedingHarvesters[0].id;
      }
    }
  },

  defender: function() {
    var enemy = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (enemy) {
      var range = this.pos.getRangeTo(enemy);
      if (range < 12) {
        this.moveTo(enemy);
        this.attack(enemy);
      }
    }
  },

  courier: function() {
    var dumpTarget = this.pos.findClosestByRange(this.room.find(FIND_MY_STRUCTURES).filter(function(structure) {
      return structure.energyCapacity && structure.energy < structure.energyCapacity && structure.structureType !== STRUCTURE_LINK;
    }));

    if (this.carry.energy === this.carryCapacity) {
      this.memory.task = 'deliver';
    } else if (!dumpTarget || this.carry.energy === 0) {
      this.memory.task = 'pickup';
    }

    if (!dumpTarget) {
      dumpTarget = this.room.getControllerEnergyDropFlag();
    }

    if (this.memory.task === 'pickup') {
      var targets = this.room.courierTargets();

      if (!this.memory.target) {
        var harvesters = this.room.getEnergySourcesThatNeedsStocked();
        var closest = this.pos.findClosestByRange(harvesters);
        this.memory.target = closest ? closest.id : '';
      }

      if (this.memory.target) {
        var target = Game.getObjectById(this.memory.target);
        var result;
        if (target) {
          result = this.takeEnergyFrom(target);
        }
        if (!target || result === 0) {
          this.memory.target = '';
        }
      } else {
        this.deliverEnergyTo(dumpTarget);
      }
    } else {
      this.deliverEnergyTo(dumpTarget);
    }
  },

  healer: function() {
    var target = this.pos.findClosestByRange(FIND_MY_CREEPS, {
      filter: function(object) {
        return object.hits < object.hitsMax;
      }
    });

    if (target) {
      this.moveTo(target);
      this.heal(target);
      this.rangedHeal(target);
    }
  },

  builder: function() {
    if (this.carry.energy === this.carryCapacity) {
      this.memory.task = 'work';
    } else if (this.carry.energy === 0 || this.memory.task === 'stockup') {
      this.memory.target = null;
      this.memory.task = 'stockup';
      if (this.room.droppedControllerEnergy()) {
        this.takeEnergyFrom(this.room.droppedControllerEnergy());
      } else if (this.room.getControllerLink() && !this.room.getControllerLink().isEmpty()) {
        this.takeEnergyFrom(this.room.getControllerLink());
      } else if (this.room.getStorage() && !this.room.getStorage().isEmpty()) {
        this.takeEnergyFrom(this.room.getStorage());
      }
    }

    if (this.memory.task === 'work') {
      var constructionSites = this.room.getConstructionSites();
      if (constructionSites.length) {
        var closestConstructionSite = this.pos.findClosestByRange(constructionSites);
        this.moveToAndBuild(closestConstructionSite);
      } else if (this.memory.target) {
        var target = Game.getObjectById(this.memory.target);
        if (target.hits < target.hitsMax) {
          this.moveToAndRepair(target);
        } else {
          this.memory.target = null;
        }
      } else {
        var damagedStructures = this.room.getStructures().sort(function(structureA, structureB) {
          return (structureA.hits / structureA.hitsMax) - (structureB.hits / structureB.hitsMax);
        });

        if (damagedStructures.length) {
          this.memory.target = damagedStructures[0].id;
        }
      }
    }
  },

  upgrader: function() {
    var empty = this.carry.energy === 0;
    if (!empty) {
      this.moveToAndUpgrade(this.room.controller);
    } else if (empty && this.room.droppedControllerEnergy()) {
      this.takeEnergyFrom(this.room.droppedControllerEnergy());
    } else if (empty && this.room.getLinks().length) {
      var closestLink = this.pos.findClosestByRange(this.room.getLinks());
      if (this.pos.getRangeTo(closestLink) < 5) {
        this.takeEnergyFrom(closestLink);
      } else {
          this.moveToAndUpgrade(this.room.controller);
      }
    }
  },

  roadworker: function() {
    if (this.carry.energy === 0) {
      var closestEnergySource = this.pos.findClosestByRange(this.room.getEnergyStockSources());
      if (closestEnergySource) {
        this.takeEnergyFrom(closestEnergySource);
      }
    } else {
      var roads = this.room.getRoads().filter(function(road) {
        return road.hits < road.hitsMax;
      });
      if (roads.length) {
        var road = this.pos.findClosestByRange(roads);
        this.moveToAndRepair(road);
      } else {
        this.suicide();
      }
    }
  },

  mailman: function() {
    if (this.carry.energy === 0) {
      this.memory.task = 'stock';
    } else if (this.carry.energy === this.carryCapacity) {
      this.memory.task = 'deliver';
    }

    if (this.memory.task === 'deliver') {
      var target = this.pos.findClosestByRange(this.room.find(FIND_MY_CREEPS).filter(function(creep) {
        return creep.needsEnergyDelivered();
      }));
      if (target) {
        this.deliverEnergyTo(target);
      }
    } else {
      var closestEnergySource = this.pos.findClosestByRange(this.room.getEnergyStockSources());
      if (closestEnergySource) {
        this.takeEnergyFrom(closestEnergySource);
      }
    }
  },

  scout: function() {
    if (this.findUnvisitedScoutFlags().length > 0) {
      if (this.carry.enery === this.carryCapacity) {
        this.moveToThenDrop(this.getSpawn());
      } else if (this.room.getDismantleFlag()) {
        var structure = this.room.getStructureAt(this.room.getDismantleFlag().pos);
        this.moveToAndDismantle(structure);
      } else {
        this.scout();
      }
    } else if (!this.room.getControllerOwned()){
      this.moveToAndClaimController(this.room.controller);
    } else if (this.room.getConstructionSites().length && this.carry.energy > 0) {
      this.moveToAndBuild(this.pos.findClosestByRange(this.room.getConstructionSites()));
    } else if (this.carry.energy === 0) {
      var droppedEnergies = this.room.getDroppedEnergy();
      if (droppedEnergies.length > 0) {
        this.takeEnergyFrom(this.pos.findClosestByRange(droppedEnergies));
      }
    } else {
      this.moveToAndUpgrade(this.room.controller);
    }
  }
};

Creep.prototype.work = function() {
  var creepFlag = Game.flags[this.name];
  // move to creep flag if it is defined.
  if (creepFlag !== undefined) {
    if (this.pos.getRangeTo(creepFlag) === 0) {
      creepFlag.remove();
    } else {
      this.moveTo(creepFlag);
    }
  } else if (this.memory.role && roles[this.memory.role]) {
    roles[this.memory.role].call(this);
  }
};

Creep.prototype.targetSource = function() {
  return this.room.find(FIND_SOURCES).filter(function(source) {
    return this.memory.source === source.id;
  }.bind(this))[0];
};

Creep.prototype.getSpawn = function() {
  for (var spawnName in Game.spawns) {
    var spawn = Game.spawns[spawnName];
    if (spawn.room === this.room) {
      return spawn;
    }
  }
  return Game.spawns(this.memory.spawn);
};

Creep.prototype.moveToAndClaimController = function(controller) {
  if(this.pos.getRangeTo(controller) > 1) {
    this.moveTo(controller);
  } else {
    this.claimController(controller);
  }
};

Creep.prototype.moveToThenDrop = function(target) {
  if (this.pos.getRangeTo(target) > 1) {
    this.moveTo(target);
  } else {
    this.dropEnergy();
  }
}

var originalMoveTo = Creep.prototype.moveTo;
Creep.prototype.moveTo = function() {
  var args = [].map.call(arguments, function(arg) { return arg; });
  var potentialOptions;
  if (typeof arguments[0] === 'number') {
    potentialOptions = args[2];
  } else {
    potentialOptions = args[1];
  }
  if (!potentialOptions) {
    potentialOptions = {};
    args.push(potentialOptions);
  }
  if (this.memory.role !== 'upgrader' && this.room.controller && typeof potentialOptions === 'object') {
    var coord = this.room.controller.pos;
    var avoid = [];
    for (var x = coord.x - 1; x <= coord.x + 1; x++) {
      for (var y = coord.y - 1; y <= coord.y + 1; y++) {
        avoid.push({x: x, y: y});
      }
    }

    if (potentialOptions.avoid) {
      potentialOptions.avoid = potentialOptions.avoid.concat(avoid);
    } else {
      potentialOptions.avoid = avoid;
    }
  }

  if (!potentialOptions.reusePath) {
    potentialOptions.reusePath = 20;
  }

  return originalMoveTo.apply(this, args);
};

Creep.prototype.moveToAndHarvest = function(target) {
  if (this.pos.getRangeTo(target) > 1) {
    this.moveTo(target);
  } else {
    this.harvest(target);
  }
};

Creep.prototype.moveToAndUpgrade = function(target) {
  if (this.pos.getRangeTo(target) > 1) {
    this.moveTo(this.room.controller);
  } else {
    this.upgradeController(this.room.controller);
  }
};

Creep.prototype.moveToAndBuild = function(target) {
  var range = this.pos.getRangeTo(target);
  if (range > 1) {
    this.moveTo(target);
  }
  if (range <= 3) {
    this.build(target);
  }
};

Creep.prototype.hasVisitedFlag = function(flag) {
  var visitedFlags = this.memory.visitedFlags || [];
  return visitedFlags.indexOf(flag.name) !== -1;
};

Creep.prototype.findUnvisitedScoutFlags = function() {
  if (!this._unvisitedFlags) {
    var flags = Game.getScoutFlags();
    this._unvisitedFlags = flags.filter((flag) => {
      return !this.hasVisitedFlag(flag);
    });
  }
  return this._unvisitedFlags;
};

Creep.prototype.moveToAndDismantle = function(target) {
  if (this.pos.getRangeTo(target) === 1) {
    this.dismantle(target);
  } else {
    this.moveTo(target);
  }
};

Creep.prototype.scout = function() {
  var unvisitedFlags = this.findUnvisitedScoutFlags();
  unvisitedFlags.sort((flagA, flagB) => {
    return parseInt(flagA.name) - parseInt(flagB.name);
  });
  var targetFlag = unvisitedFlags[0];
  if (this.pos.getRangeTo(targetFlag) === 0) {
    if (!this.memory.visitedFlags) {
      this.memory.visitedFlags = [];
    }
    this.memory.visitedFlags.push(targetFlag.name);
    targetFlag = unvisitedFlags[1];
  }
  this.moveTo(targetFlag, {reusePath: 50});
};

Creep.prototype.moveToAndRepair = function(target) {
  var range = this.pos.getRangeTo(target);
  if (this.pos.getRangeTo(target) > 1) {
    this.moveTo(target);
  }
  if (range <= 3) {
    this.repair(target);
  }
};

Creep.prototype.takeEnergyFrom = function(target) {
  var range = this.pos.getRangeTo(target);
  if (target instanceof Energy) {
    if (range > 1) {
      this.moveTo(target);
    } else {
      return this.pickup(target);
    }
  } else {
    if (range > 1) {
      this.moveTo(target);
    } else {
      return target.transferEnergy(this);
    }
  }
};

Creep.prototype.deliverEnergyTo = function(target) {
  var range = this.pos.getRangeTo(target);
  if (target instanceof Flag) {
    if (range === 0) {
      this.dropEnergy();
    } else {
      this.moveTo(target);
    }
  } else {
    if (range <= 1) {
      this.transferEnergy(target);
    } else {
      this.moveTo(target);
    }
  }
};

Creep.prototype.needsOffloaded = function() {
  return this.carry.energy / this.carryCapacity > 0.6;
};

Creep.prototype.needsEnergyDelivered = function() {
  if (this.memory.role === 'harvester' || this.memory.role === 'courier' || this.memory.role === 'mailman') {
    return false;
  } else {
    return this.carry.energy / this.carryCapacity < 0.6;
  }
};

Creep.prototype.cost = function() {
  return bodyCosts.calculateCosts(this.body);
};
