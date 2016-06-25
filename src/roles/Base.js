import bodyCosts from '../utils/body-costs';
import { Creep, Flag, Energy } from 'screeps-globals';

export default class Base extends Creep {
  constructor(creep) {
    super(creep.id);
  }

  work() {
    if (this.needsRenewed()) {
      this.attemptRenew();
    }
    const creepFlag = Game.flags[this.name];
    // move to creep flag if it is defined.
    if (creepFlag !== undefined) {
      if (this.pos.getRangeTo(creepFlag) === 0) {
        creepFlag.remove();
      } else {
        this.moveTo(creepFlag);
      }
    } else if (this.shouldBeRecycled()) {
      this.recycle();
    } else {
      this.performRole();
    }
  }

  needsRenewed() {
    return !this.shouldBeRecycled() && this.ticksToLive / CREEP_LIFE_TIME < 0.5;
  }

  attemptRenew() {
    const spawn = this.getSpawn();
    if (this.needsRenewed() && this.pos.getRangeTo(spawn) === 1 && !spawn.spawning) {
      spawn.renewCreep(this);
    }
  }

  performRole() {
    console.log(`WHOA! ${this.role()} does not have a performRole implementation!!!`); // eslint-disable-line
  }

  role() {
    return this.memory.role;
  }

  targetSource() {
    return this.room.getSources().filter(source => {
      return this.memory.source === source.id;
    })[0];
  }

  getSpawn() {
    const spawns = Object.keys(Game.spawns).map(spawnName => Game.spawns[spawnName]);
    const validSpawn = spawns.find(spawn => {
      return spawn.room === this.room;
    });
    return validSpawn || Game.spawns[this.memory.spawn];
  }

  moveToThenDrop(target) {
    if (this.pos.getRangeTo(target) > 1) {
      this.moveTo(target);
    } else {
      this.drop(RESOURCE_ENERGY);
    }
  }

  moveToAndUpgrade(target) {
    if (this.pos.getRangeTo(target) > 1) {
      this.moveTo(this.room.controller);
    } else {
      this.attemptToUpgrade();
    }
  }

  attemptToUpgrade() {
    if (this.pos.getRangeTo(this.room.controller) <= 2) {
      this.upgradeController(this.room.controller);
    }
  }

  moveToAndBuild(target) {
    const range = this.pos.getRangeTo(target);
    if (range > 1) {
      this.moveTo(target);
    }
    if (range <= 3) {
      this.build(target);
    }
  }

  hasVisitedFlag(flag) {
    const visitedFlags = this.memory.visitedFlags || [];
    return visitedFlags.indexOf(flag.name) !== -1;
  }

  findUnvisitedScoutFlags() {
    if (!this._unvisitedFlags) {
      const flags = Game.getScoutFlags();
      this._unvisitedFlags = flags.filter((flag) => {
        return !this.hasVisitedFlag(flag);
      });
    }
    return this._unvisitedFlags;
  }

  dismantleFlag(flag) {
    const structure = this.room.getStructureAt(flag.pos);
    if (structure) {
      this.moveToAndDismantle(structure);
    } else {
      flag.remove();
    }
  }

  moveToAndDismantle(target) {
    if (this.pos.getRangeTo(target) === 1) {
      this.dismantle(target);
    } else {
      this.moveTo(target);
    }
  }

  scout() {
    const unvisitedFlags = this.findUnvisitedScoutFlags();
    unvisitedFlags.sort((flagA, flagB) => {
      return parseInt(flagA.name, 10) - parseInt(flagB.name, 10);
    });
    let targetFlag = unvisitedFlags[0];
    if (this.pos.getRangeTo(targetFlag) === 0) {
      if (!this.memory.visitedFlags) {
        this.memory.visitedFlags = [];
      }
      this.memory.visitedFlags.push(targetFlag.name);
      targetFlag = unvisitedFlags[1];
    }
    this.moveTo(targetFlag, { reusePath: 50 });
  }

  moveToAndRepair(target) {
    const range = this.pos.getRangeTo(target);
    if (range > 1) {
      this.moveTo(target);
    }
    if (range <= 3) {
      this.repair(target);
    }
  }

  moveToAndHarvest(target) {
    if (this.pos.getRangeTo(target) > 1) {
      this.moveTo(target);
    } else {
      this.harvest(target);
    }
  }

  takeEnergyFrom(target) {
    const range = this.pos.getRangeTo(target);
    if (target instanceof Energy) {
      if (range > 1) {
        this.moveTo(target);
      }
      return this.pickup(target);
    }
    if (range > 1) {
      this.moveTo(target);
    }

    if (!target.transfer || target.structureType && target.structureType === STRUCTURE_TOWER) { // eslint-disable-line
      return target.transferEnergy(this);
    }

    return target.transfer(this, RESOURCE_ENERGY);
  }

  deliverEnergyTo(target) {
    const targetIsFlag = target instanceof Flag;
    if (targetIsFlag) {
      this.deliverEnergyToFlag(target);
    } else {
      const range = this.pos.getRangeTo(target);
      if (range <= 1) {
        this.transfer(target, RESOURCE_ENERGY);
      } else {
        this.moveTo(target);
      }
    }
  }

  deliverEnergyToFlag(flag) {
    const range = this.pos.getRangeTo(flag);
    if (range === 0) {
      this.drop(RESOURCE_ENERGY);
    } else {
      const blockingCreep = flag.pos.creep();
      if (range === 1 && blockingCreep) {
        blockingCreep.unblockFlag();
      }
      this.moveTo(flag);
    }
  }

  unblockFlag() {
    this.moveInRandomDirection();
  }

  moveInRandomDirection() {
    const directions = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
    this.move(Math.floor(Math.random(directions.length) * directions.length));
  }

  needsOffloaded() {
    return this.carry.energy / this.carryCapacity > 0.6;
  }

  needsEnergyDelivered() {
    const blacklist = ['harvester', 'courier', 'mailman'];
    if (blacklist.indexOf(this.memory.role) !== -1) {
      return false;
    }

    return this.carry.energy / this.carryCapacity < 0.6;
  }

  cost() {
    return bodyCosts.calculateCosts(this.body);
  }

  shouldBeRecycled() {
    return false;
  }

  recycle() {
    const spawn = this.getSpawn();
    if (this.pos.getRangeTo(spawn) > 1) {
      this.moveTo(spawn);
    } else {
      spawn.recycleCreep(this);
    }
  }
}
