var roles = {
  harvester: function() {
    if (this.carry.energy < this.carryCapacity) {
      var source = this.room.find(FIND_SOURCES).filter(function(source) {
        return this.memory.source === source.id;
      }.bind(this))[0];

      this.moveTo(source);
      this.harvest(source);
    } else {
      this.moveTo(this.getSpawn());
      this.transferEnergy(this.getSpawn());
    }
  },

  defender: function() {
    var enemy = this.pos.findClosest(FIND_HOSTILE_CREEPS);
    if (enemy) {
      var range = this.pos.getRangeTo(enemy);
      if (range < 12) {
        this.moveTo(enemy);
        this.attack(enemy);
      }
    }
  },

  healer: function() {
    var target = this.pos.findClosest(FIND_MY_CREEPS, {
      filter: function(object) {
        return object.hits < object.hitsMax;
      }
    });

    if (target) {
      this.moveTo(target);
      this.heal(target);
      this.RangedHeal(target);
    }
  }
}

Creep.prototype.work = function() {
  if (this.memory.role) {
    roles[this.memory.role].call(this);
  }
};

var spawns = {};
Creep.prototype.getSpawn = function() {
  if (!spawns[this.room.name]) {
    spawns[this.room.name] = Object.keys(this.room.spawns)[0];
  }

  return spawns[this.room.name];
};
