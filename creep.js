require('room');

var roles = {
  harvester: function() {
    if (this.carry.energy < this.carryCapacity) {
      var source = this.targetSource();
      this.moveTo(source);
      this.harvest(source);
    } else {
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
    if (this.carry.energy / this.carryCapacity < 0.6) {
      if (!this.memory.target) {
        var harvester = this.room.getHarvesters().filter(function(harvester) {
          return harvester.carry.energy / harvester.carryCapacity > 0.6;
        })[0];

        if (harvester) {
          this.takeEnergyFrom(harvester);
        } else {
          this.moveTo(this.getSpawn());
          this.transferEnergy(this.getSpawn());
        }
      }
    } else {
      this.moveTo(this.getSpawn());
      this.transferEnergy(this.getSpawn());
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
  target.transferEnergy(this);
};
