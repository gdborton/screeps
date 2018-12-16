function initializeReporter() {
  if (!Memory.reporter) {
    console.log('initializing reporter');
    Memory.reporter = {
      runningSince: Game.time,
      rooms: {

      },
    };
  }
}

function gameRooms() {
  return Object.entries(Game.rooms).map(([name, room]) => room);
}

function updateReport() {
  gameRooms().forEach(room => {
    const eventLog = room.getEventLog();
    let energyHarvested = 0;
    let energyOnRepair = 0;
    let energyOnUpgrade = 0;
    let energyOnBuild = 0;
    let currentStorage = room.find(FIND_MY_STRUCTURES).reduce((acc, structure) => {
      if (structure.store) {
        return acc + structure.store[RESOURCE_ENERGY];
      }
      return acc;
    }, 0);
    const energyPotential = room.find(FIND_SOURCES).length * SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME;
    const energyOnDecay = room.find(FIND_DROPPED_RESOURCES).filter(resource => {
      return resource.resourceType === RESOURCE_ENERGY;
    }).length;
    const energyOnCreeps = room.find(FIND_MY_CREEPS).reduce((acc, creep) => {
      return acc + creep.body.reduce((bodyCost, bodyPart) => {
        return bodyCost + BODYPART_COST[bodyPart.type];
      }, 0);
    }, 0) / CREEP_LIFE_TIME;
    eventLog.forEach(({ event, data }) => {
      const { amount, energySpent } = data || {};
      if (event === EVENT_HARVEST) {
        energyHarvested += amount;
      } else if (event === EVENT_REPAIR) {
        energyOnRepair += energySpent;
      } else if (event === EVENT_UPGRADE_CONTROLLER) {
        energyOnUpgrade += energySpent;
      } else if (event === EVENT_BUILD) {
        energyOnBuild += energySpent;
      }
    });
    Memory.reporter.rooms[room.name] = Memory.reporter.rooms[room.name] || {
      'energy harvested': 0,
      'energy on repair': 0,
      'energy on upgrad': 0,
      'energy on builds': 0,
      'energy on decays': 0,
      'energy on creeps': 0,
      'current storages': currentStorage,
      'energy storerate': 0,
    };
    Memory.reporter.rooms[room.name]['energy harvested'] += energyHarvested;
    Memory.reporter.rooms[room.name]['energy on repair'] += energyOnRepair;
    Memory.reporter.rooms[room.name]['energy on upgrad'] += energyOnUpgrade;
    Memory.reporter.rooms[room.name]['energy on builds'] += energyOnBuild;
    Memory.reporter.rooms[room.name]['energy potential'] += energyPotential;
    Memory.reporter.rooms[room.name]['energy on decays'] += energyOnDecay;
    Memory.reporter.rooms[room.name]['energy on creeps'] += energyOnCreeps;
    Memory.reporter.rooms[room.name]['energy storerate'] += currentStorage - Memory.reporter.rooms[room.name]['current storages'];
    Memory.reporter.rooms[room.name]['current storages'] = currentStorage;
    Memory.reporter.rooms[room.name]['energy unharvest'] = Memory.reporter.rooms[room.name]['energy potential'] - Memory.reporter.rooms[room.name]['energy harvested'];
  });
}

function report() {
  initializeReporter();
  updateReport();

  return function generateReport(reset) {
    if (reset) {
      Memory.reporter = undefined;
      initializeReporter();
      updateReport();
    }
    Object.entries(Memory.reporter.rooms).forEach(([roomName, roomValues]) => {
      const runningFor = (Game.time - Memory.reporter.runningSince + 1);
      console.log(`== ${roomName} == ${runningFor} ticks`);
      Object.entries(roomValues).forEach(([key, value]) => {
        if (key === 'current storages') {
          console.log(key, value);
        } else {
          console.log(key, value / runningFor);
        }
      });
    });
  };
}

module.exports = {
  wrap(fn) {
    Game.report = report();
    return fn();
  },
}