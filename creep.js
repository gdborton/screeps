require('room');

var roles = {
  harvester: function() {
    if (this.carry.energy < this.carryCapacity) {
      var source = this.targetSource();
      this.moveTo(source);
      this.harvest(source);
    } else if (this.room.courierCount() === 0) {
      this.moveTo(this.getSpawn());
      this.transferEnergy(this.getSpawn());
    }
  },

  defender: function() {
    var enemy = this.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    if (enemy) {
      var range = this.pos.getRangeTo(enemy);
      if (range < 12) {
        this.moveTo(enemy);
        this.attack(enemy);
      }
    }
  },

  courier: function() {
    var spawn = this.getSpawn();
    var dumpTarget = spawn.pos.findClosestByPath(this.room.find(FIND_MY_STRUCTURES).filter(function(structure) {
      return structure.structureType !== STRUCTURE_SPAWN && structure.energyCapacity && structure.energy < structure.energyCapacity;
    }));
    if (!dumpTarget) {
      dumpTarget = spawn;
    }

    if (this.carry.energy / this.carryCapacity < 0.6) {
      var targets = this.room.courierTargets();

      if (!this.memory.target) {
        var harvesters = this.room.getCreepsThatNeedOffloading();
        var closest = this.pos.findClosestByPath(harvesters);
        this.memory.target = closest ? closest.name : '';
      }

      if (this.memory.target) {
        var result = this.takeEnergyFrom(Game.creeps[this.memory.target]);
        if (result === 0) {
          this.memory.target = '';
        }
      } else {
        this.moveTo(dumpTarget);
        this.transferEnergy(dumpTarget);
      }
    } else {
      this.moveTo(dumpTarget);
      this.transferEnergy(dumpTarget);
    }
  },

  healer: function() {
    var target = this.pos.findClosestByPath(FIND_MY_CREEPS, {
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
    var constructionSites = this.room.getConstructionSites();
    if (this.carry.energy === 0) {
      var closestEnergySource = this.pos.findClosestByPath(this.room.getEnergySourceStructures());
      if (closestEnergySource) {
        this.moveTo(closestEnergySource);
        this.takeEnergyFrom(closestEnergySource);
      }
    } else if (constructionSites.length) {
      var closestConstructionSite = this.pos.findClosestByPath(constructionSites);
      this.moveTo(closestConstructionSite);
      this.build(closestConstructionSite);
    } else {
      this.moveTo(this.room.controller);
      this.upgradeController(this.room.controller);
    }
  },

  mailman: function() {
    if (this.carry.energy === 0) {
      this.memory.task = 'stock';
    } else if (this.carry.energy === this.carryCapacity) {
      this.memory.task = 'deliver';
    }

    if (this.memory.task === 'deliver') {
      var target = this.pos.findClosestByPath(this.room.find(FIND_MY_CREEPS).filter(function(creep) {
        return creep.needsEnergyDelivered();
      }));
      if (target) {
        this.moveTo(target);
        this.transferEnergy(target);
      }
    } else {
      var closestEnergySource = this.pos.findClosestByPath(this.room.getEnergySourceStructures());
      if (closestEnergySource) {
        this.moveTo(closestEnergySource);
        this.takeEnergyFrom(closestEnergySource);
      }
    }
  }
};

Creep.prototype.work = function() {
  if (this.memory.role) {
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
};

Creep.prototype.takeEnergyFrom = function(target) {
  this.moveTo(target);
  return target.transferEnergy(this);
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
