import './_base';
import bodyCosts from '../utils/body-costs';

export default class Spawn extends StructureSpawn {
  buildHarvester(availableEnergy) {
    const sources = this.room.getSourcesNeedingHarvesters();
    const closestSource = this.pos.findClosestByRange(sources);

    if (closestSource) {
      const sourceId = closestSource.id;
      const body = [MOVE, WORK, WORK, CARRY];
      let cost = bodyCosts.calculateCosts(body);
      let forcedReturn = false;
      while (cost <= availableEnergy && !forcedReturn) {
        if (body.filter(part => { return part === WORK; }).length < 5) {
          body.push(WORK);
        } else if (body.filter(part => { return part === CARRY; }).length < 10) {
          body.push(CARRY);
        } else {
          body.push(WORK);
          forcedReturn = true;
        }
        cost = bodyCosts.calculateCosts(body);
      }

      while (cost > availableEnergy) {
        body.pop();
        cost = bodyCosts.calculateCosts(body);
      }
      this.createCreep(body, undefined, { role: 'harvester', source: sourceId });
    }
  }

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

  buildRemoteHarvester() {
    const target = this.room.getReserveFlagsNeedingRemoteHarvesters()[0];
    const body = [
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
      WORK, WORK, WORK, WORK, WORK, CARRY, CARRY,
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

  buildWanderer() {
    this.createCreep([MOVE], undefined, { role: 'wanderer' });
  }

  buildMailman(availableEnergy) {
    const body = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY];
    let cost = bodyCosts.calculateCosts(body);
    while (cost < availableEnergy) {
      body.push(MOVE);
      body.push(CARRY);
      cost = bodyCosts.calculateCosts(body);
    }

    while (cost > availableEnergy) {
      body.pop();
      cost = bodyCosts.calculateCosts(body);
    }

    this.createCreep(body, undefined, { role: 'mailman' });
  }

  buildReserver(availableEnergy) {
    const body = [];
    let cost = bodyCosts.calculateCosts(body);
    while (cost < availableEnergy) {
      body.push(CLAIM);
      body.push(MOVE);
      cost = bodyCosts.calculateCosts(body);
    }

    while (cost > availableEnergy) {
      body.pop();
      cost = bodyCosts.calculateCosts(body);
    }

    this.createCreep(body, undefined, { role: 'reserver', room: this.room.name, spawn: this.name });
  }

  buildCourier(availableEnergy) {
    const body = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY];
    let cost = bodyCosts.calculateCosts(body);
    const maxCarryParts = this.room.getStorage() && this.room.getLinks().length > 1 ? 10 : 100;
    let carryParts = 3;
    while (cost < availableEnergy && carryParts < maxCarryParts) {
      body.push(MOVE);
      body.push(CARRY);
      carryParts++;
      cost = bodyCosts.calculateCosts(body);
    }

    while (cost > availableEnergy) {
      body.pop();
      cost = bodyCosts.calculateCosts(body);
    }

    this.createCreep(body, undefined, { role: 'courier' });
  }

  buildRoadWorker() {
    const body = [MOVE, WORK, WORK, CARRY];
    this.createCreep(body, undefined, { role: 'roadworker' });
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

  buildClaimer() {
    const body = [MOVE, CLAIM];
    this.createCreep(body, undefined, { role: 'claimer' });
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

  buildUpgrader(availableEnergy) {
    const body = [MOVE, WORK, WORK, CARRY];
    let workParts = 2;
    let cost = bodyCosts.calculateCosts(body);
    let workPartsNeeded = this.room.maxEnergyProducedPerTick() - this.room.upgraderWorkParts();
    if (this.room.controller.level === 8) {
      workPartsNeeded = Math.min(15, workPartsNeeded);
    }
    if (this.room.controller.pos.freeEdges() > 1) {
      workPartsNeeded = Math.min(workPartsNeeded, this.room.maxEnergyProducedPerTick() / 2);
    }
    while (cost < availableEnergy && workParts < workPartsNeeded) {
      body.push(WORK);
      workParts++;
      cost = bodyCosts.calculateCosts(body);
    }

    while (cost > availableEnergy) {
      body.pop();
      cost = bodyCosts.calculateCosts(body);
    }

    this.createCreep(body, undefined, { role: 'upgrader' });
  }

  work() {
    if (this.spawning) {
      return;
    }
    const harvesterCount = this.room.harvesterCount();
    const availableEnergy = this.availableEnergy();
    if (availableEnergy >= 300 && availableEnergy < this.maxEnergy()) {
      if (harvesterCount < 1) {
        this.buildHarvester(availableEnergy);
      } else if (this.room.needsCouriers()) {
        this.buildCourier(availableEnergy);
      } else if (this.room.needsRoadWorkers()) {
        this.buildRoadWorker(availableEnergy);
      }
    } else if (availableEnergy === this.maxEnergy()) {
      if (this.room.needsHarvesters()) {
        this.buildHarvester(availableEnergy);
      } else if (this.room.needsCouriers()) {
        this.buildCourier(availableEnergy);
      } else if (this.room.needsUpgraders()) {
        this.buildUpgrader(availableEnergy);
      } else if (this.room.mailmanCount() < 2 && this.maxEnergy() < 600) {
        this.buildMailman(availableEnergy);
      } else if (this.room.needsBuilders()) {
        this.buildBuilder(availableEnergy);
      } else if (this.room.needsScouts()) {
        this.buildScout(availableEnergy);
      } else if (this.room.needsScoutHarvesters()) {
        this.buildScoutHarvester(availableEnergy);
      } else if (this.room.needsClaimers()) {
        this.buildClaimer(availableEnergy);
      } else if (this.room.needsWanderers()) {
        this.buildWanderer();
      } else if (this.room.needsReservers()) {
        this.buildReserver(availableEnergy);
      } else if (this.room.needsRemoteHarvesters()) {
        this.buildRemoteHarvester();
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
    }
  }
}
