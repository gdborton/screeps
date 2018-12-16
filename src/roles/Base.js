import bodyCosts from '../utils/body-costs';
import { Creep, Flag, Energy } from 'screeps-globals';
import profiler from 'screeps-profiler';

class Base extends Creep {
  constructor(creep) {
    super(creep.id);
  }

  work() {
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

  // prioritized list of places you can pull resources from.
  energySources() {
    return [
      ...this.room.getLinks(),
      ...[this.room.getStorage()],
      ...this.room.getDroppedEnergy(),
      ...this.room.getContainers(),
    ];
  }


  gatherEnergy() {
    const validEnergySources = this.energySources().filter(thing => {
      try {
        return thing && thing.availableEnergy() > this.availableSpace();
      } catch(e) {
        console.log(thing, 'does not have an availableEnergy function');
        throw e;
      }
    });
    if (validEnergySources.length) {
      return this.takeEnergyFrom(this.pos.findClosestByRange(validEnergySources));
    }
  }

  rankedEnergySpendTargets() {
    const targets = [
      [...this.room.getExtensions(), ...this.room.getSpawns()],
      this.room.getConstructionSites(),
    ];
    if (this.room.controller && this.room.controller.my) {
      targets.push([this.room.controller]);
    }
    return targets;
  }

  spendResources() {
    const spendTarget = this.rankedEnergySpendTargets().reduce((target, potentialTargets) => {
      if (target) return target;
      return this.pos.findClosestByRange(potentialTargets.filter(potentialTarget => {
        return potentialTarget.needsEnergy();
      }));
    }, undefined);

    if (spendTarget) {
      return this.moveToAndSpendEnergyOn(spendTarget);
    }
  }

  needsRenewed() {
    return !this.shouldBeRecycled() && this.ticksToLive / CREEP_LIFE_TIME < 0.5;
  }

  attemptRenew() {
    this.room.getSpawns().forEach(spawn => {
      if (this.needsRenewed() && this.pos.getRangeTo(spawn) === 1 && !spawn.spawning) {
        spawn.renewCreep(this);
      }
    });
  }

  moveToAndSpendEnergyOn(target) {
    if (target instanceof ConstructionSite) {
      return this.moveToAndBuild(target);
    } else if (target instanceof Structure || target instanceof Creep) {
      return this.deliverEnergyTo(target);
    } else if (target instanceof Source) {
      return this.deliverEnergyTo(target);
    }
    console.trace('unkown target');
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
    const spawn = validSpawn || Game.spawns[this.memory.spawn];
    if (spawn) {
      return spawn.enhance();
    }
    return spawn;
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

  moveToAndClaim(target) {
    if (this.pos.getRangeTo(target) > 1) {
      return this.moveTo(target);
    }
    return this.claimController(target);
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

    if (!target.transfer || target.structureType) { // eslint-disable-line
      return this.withdraw(target, RESOURCE_ENERGY);
    }

    return target.transfer(this, RESOURCE_ENERGY);
  }

  /**
   * Determine whether or not the supplied spawn should build this role. If it
   * should, generate and return the desired body, name and memory otherwise
   * return undefined.
   *
   * @param {Spawn} spawn The spawn that the role should generate a body for.
   */
  static createCreepFor(spawn) {
    /**
     * This is the
     * This is currently defaulting to undefined to allow for incremental
     * implementation, eventually this should be marked as deprecated to enforce
     * the new role pattern.
     */
  }

  isFull() {
    return this.totalCarryLoad() === this.carryCapacity;
  }

  isEmpty() {
    return !this.isFull() && this.totalCarryLoad() === 0;
  }

  availableSpace() {
    return this.carryCapacity - this.totalCarryLoad();
  }

  totalCarryLoad() {
    return Object.entries(this.carry).reduce((acc, [key, val]) => {
      return acc + val;
    }, 0);
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

profiler.registerClass(Base, 'CreepBase');

export default Base;
