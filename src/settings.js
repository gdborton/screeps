module.exports = {
  courierToWorkerRatio: 0.5,
  // count of structures that can be built at each controller level.
  buildingCount: {
    1: {
      spawns: 1
    },
    2: {
      spawns: 1,
      extensions: 5,
      ramparts: true,
      walls: true
    },
    3: {
      spawns: 1,
      extensions: 10,
      ramparts: true,
      walls: true,
      roads: true
    },
    4: {
      spawns: 1,
      extensions: 20,
      ramparts: true,
      walls: true,
      roads: true,
      storage: 1
    },
    5: {
      spawns: 1,
      extensions: 30,
      ramparts: true,
      walls: true,
      roads: true,
      storage: 1
    },
    6: {
      spawns: 1,
      extensions: 40,
      ramparts: true,
      walls: true,
      roads: true,
      storage: 1
    },
    7: {
      spawns: 1,
      extensions: 50,
      ramparts: true,
      walls: true,
      roads: true,
      storage: 1
    },
    8: {
      spawns: 1,
      extensions: 60,
      ramparts: true,
      walls: true,
      roads: true,
      storage: 1
    }
  }
};
