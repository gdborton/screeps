import './_base';
import { STRUCTURE_SPAWN } from '../utils/constants';
import bodyCosts from '../utils/body-costs';
import { roleList } from '../utils/role-map';

export default class Spawn extends StructureSpawn {
  static structureType = STRUCTURE_SPAWN;

  buildScout(availableEnergy) {
    const body = [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK];
    let cost = bodyCosts.calculateCosts(body);
    while (cost < availableEnergy && body.length < 50) {
      body.push(MOVE);
      body.push(Game.dismantleFlags().length ? WORK : CARRY);
      cost = bodyCosts.calculateCosts(body);
    }
    while (cost > availableEnergy) {
      body.pop();
      body.pop();
      cost = bodyCosts.calculateCosts(body);
    }
    this.createCreep(body, undefined, { role: 'scout', spawn: this.name });
  }

  buildRemoteCourier() {
    const target = this.room.getReserveFlagsNeedingRemoteCouriers()[0];
    const body = [];
    while (body.length < 20) {
      body.push(MOVE);
      body.push(CARRY);
    }
    this.createCreep(body, undefined, {
      role: 'remotecourier',
      flag: target.name,
      spawn: this.name,
    });
  }

  buildRemoteHarvester() {
    const target = this.room.getReserveFlagsNeedingRemoteHarvesters()[0];
    const body = [
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
      WORK, WORK, WORK, WORK, WORK, CARRY,
    ];
    this.createCreep(body, undefined, {
      role: 'remoteharvester',
      spawn: this.name,
      flag: target.name,
    });
  }

  buildScoutHarvester() {
    const body = [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK];
    this.createCreep(body, undefined, { role: 'scoutharvester' });
  }

  buildBuilder(availableEnergy) {
    const body = [MOVE, MOVE, WORK, CARRY];
    let cost = bodyCosts.calculateCosts(body);

    while (cost < availableEnergy) {
      body.push(MOVE);
      body.push(CARRY);
      body.push(WORK);
      cost = bodyCosts.calculateCosts(body);
    }

    while (cost > availableEnergy || body.length > 50) {
      body.pop();
      cost = bodyCosts.calculateCosts(body);
    }

    this.createCreep(body, undefined, { role: 'builder' });
  }

  buildSourceTaker(availableEnergy) {
    const body = [];
    let cost = bodyCosts.calculateCosts(body);
    let toughParts = 0;
    while (toughParts < 10) {
      toughParts++;
      body.push(TOUGH, MOVE);
    }
    let rangedAttackParts = 0;
    while (cost < availableEnergy) {
      rangedAttackParts++;
      body.push(RANGED_ATTACK, MOVE);
      cost = bodyCosts.calculateCosts(body);
    }

    body.push(HEAL);

    while (cost > availableEnergy || body.length > 50) {
      body.pop();
      cost = bodyCosts.calculateCosts(body);
    }

    this.createCreep(body, undefined, { role: 'sourcetaker' });
  }

  work() {
    if (this.spawning) {
      return;
    }

    let creepToBuild = undefined;
    roleList.forEach((RoleClass) => {
      if (creepToBuild) return false;
      creepToBuild = RoleClass.createCreepFor(this);
    });

    if (creepToBuild) {
      if (bodyCosts.calculateCosts(creepToBuild.body) <= this.availableEnergy()) {
        return this.createCreep(creepToBuild.body, creepToBuild.name, creepToBuild.memory);
      } else {
        this.extend();
        return false;
      }
    }

    const availableEnergy = this.availableEnergy();
    if (availableEnergy === this.maxEnergy()) {
      if (this.room.needsBuilders()) {
        this.buildBuilder(availableEnergy);
      } else {
        this.extend();
      }
    } else {
      this.extend();
    }
  }

  maxEnergy() {
    return this.room.energyCapacityAvailable;
  }

  needsRepaired() {
    return this.hits < this.hitsMax;
  }

  availableEnergy() {
    return this.room.energyAvailable;
  }

  extend() {
    if (this.room.canBuildExtension()) {
      this.room.createConstructionSite(this.pos.x - 1, this.pos.y - 1, STRUCTURE_EXTENSION);
      this.room.createConstructionSite(this.pos.x - 1, this.pos.y + 1, STRUCTURE_EXTENSION);
    }
  }
}
