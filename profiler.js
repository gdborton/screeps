var usedOnStart = 0;
var enabled = false;

function additionReducer(val1, val2) {
  return val1 + val2;
}

function setupMemory() {
  if (!Memory.profiler) {
    Memory.profiler = {
      map: {},
      totalTime: 0,
      bucketSize: 0,
      enabledTick: Game.time
    };
  }
}

function overloadCPUCalc() {
  if (Game.rooms.sim) {
    Game.getUsedCpu = function() {
      return Game.rooms.sim ? performance.now() - usedOnStart : Game.getUsedCpu();
    };
  }
}

function hookUpPrototypes() {
  Profiler.prototypes.forEach(function eachPrototype(proto) {
    var foundProto = proto.val.prototype;
    Object.keys(foundProto).forEach(function eachKeyOnPrototype(prototypeFunctionName) {
      var key = proto.name + '.' + prototypeFunctionName;

      try {
        if (typeof foundProto[prototypeFunctionName] === 'function') {
          var originalFunction = foundProto[prototypeFunctionName];
          foundProto[prototypeFunctionName] = function() {
            var start = Game.getUsedCpu();
            var result = originalFunction.apply(this, arguments);
            var end = Game.getUsedCpu();
            Profiler.record(key, end - start);
            return result;
          };
        }
      } catch (ex) { }
    });
  });
}

var Profiler = {
  printProfile() {
    var stats = Object.keys(Memory.profiler.map).map(function(functionName) {
      var functionCalls = Memory.profiler.map[functionName];
      return {
        name: functionName,
        calls: functionCalls.calls,
        totalTime: functionCalls.time,
        averageTime: functionCalls.time / functionCalls.calls
      }
    }).sort(function(val1, val2) {
      return val2.totalTime - val1.totalTime;
    });

    var lines = stats.map(function(data) {
      return 'calls: ' + data.calls + ',\ttotalTime: ' + data.totalTime.toFixed(4) + ',\taverageTime: ' + data.averageTime.toFixed(4) + ' --- ' + data.name;
    });

    var output = ['', '### PROFILER ###', ''];
    output = output.concat(lines.slice(0, 30));
    var elapsedTicks = Game.time - Memory.profiler.enabledTick + 1;
    output.push('Average CPU/tick: ' + (Memory.profiler.totalTime / elapsedTicks).toFixed(4) + ' Total tick time: ' + Memory.profiler.totalTime.toFixed(4) + ' Ticks: ' + elapsedTicks + ' Bucket Size (20 limit): ' + Memory.profiler.bucketSize);
    console.log(output.join('\n'));
  },
  prototypes: [
    //{ name: 'Game', val: Game },
    { name: 'Room', val: Room },
    { name: 'Structure', val: Structure },
    { name: 'Spawn', val: Spawn },
    { name: 'Creep', val: Creep },
    { name: 'RoomPosition', val: RoomPosition }
  ],
  map: {},

  record: function(functionName, time) {
    if (!Memory.profiler.map[functionName]) {
      Memory.profiler.map[functionName] = {
        time: 0,
        calls: 0
      };
    }
    Memory.profiler.map[functionName].calls++;
    Memory.profiler.map[functionName].time += time;
  },

  endTick: function() {
    var cpuUsed = Game.getUsedCpu();
    Memory.profiler.totalTime += cpuUsed;
    if (cpuUsed < 20) {
      var newBucketSize = Memory.profiler.bucketSize + 20 - cpuUsed;
      Memory.profiler.bucketSize = Math.min(newBucketSize, 10000);
    }else if (cpuUsed > 20) {
      Memory.profiler.bucketSize -= cpuUsed - 20;
    }
  },

  enable: function enable() {
    enabled = true;
    overloadCPUCalc();
    setupMemory();
    usedOnStart = Game.getUsedCpu();
    hookUpPrototypes();
  },

  profile: function profile(callback) {
    callback();
    if (enabled) {
      Profiler.endTick();
      Profiler.printProfile();
    }
  }
};

module.exports = Profiler;
