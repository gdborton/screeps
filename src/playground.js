const expect = require('expect');

const constants = require('./utils/constants');

const TICK_END = 'TICK_END';
const CREEP = 'CREEP';
const SOURCE = 'SOURCE';
const WITHDRAW = 'WITHDRAW';
const PICKUP = 'PICKUP';
const HARVEST = 'HARVEST';
const UPGRADE_CONTROLLER = 'UPGRADE_CONTROLLER';
const DROP = 'DROP';
const TRANSFER = 'TRANSFER';
const REPAIR = 'REPAIR';

function serializeRoom() {
  return {
    terrain: [],
  };
}

function serializeRooms() {
  return Object.keys(Game.rooms).reduce((acc, roomName) => {
    return {
      ...acc,
      [roomName]: serializeRoom(Game.rooms[roomName]),
    };
  }, {});
}

function serializeCreep(creep) {
  return {
    memory: creep.memory,
    x: creep.pos.x,
    y: creep.pos.y,
    carry: creep.carry,
    body: creep.body,
    type: CREEP,
  };
}

function serializeSource(source) {
  return {
    energy: source.energy,
    ticksToRegeneration: source.ticksToRegeneration,
    type: SOURCE,
    room: source.pos.roomName,
    x: source.pos.x,
    y: source.pos.y,
  };
}

function serializeCreeps() {
  return Object.entries(Game.creeps).reduce((acc, [creepName, creep]) => {
    return {
      ...acc,
      [creep.id]: serializeCreep(creep),
    };
  }, {});
}

function serializeSources() {
  return Object.entries(Game.rooms).reduce((acc, [roomName, room]) => {
    return {
      ...acc,
      ...room.find(FIND_SOURCES).reduce((innerAc, source) => {
        return {
          ...innerAc,
          [source.id]: serializeSource(source),
        };
      }, {}),
    };
  }, {});
}

function serializeGameObjects() {
  return {
    ...serializeCreeps(),
    ...serializeSources(),
  };
}

function serializeGame() {
  return {
    rooms: serializeRooms(),
    gameObjects: serializeGameObjects(),
  };
}

function predictRooms(rooms, intent) {
  return rooms;
}

const leftMovements = {
  [constants.TOP_LEFT]: constants.TOP_LEFT,
  [constants.BOTTOM_LEFT]: constants.BOTTOM_LEFT,
  [constants.LEFT]: constants.LEFT,
};

const rightMovements = {
  [constants.TOP_RIGHT]: constants.TOP_RIGHT,
  [constants.BOTTOM_RIGHT]: constants.BOTTOM_RIGHT,
  [constants.RIGHT]: constants.RIGHT,
};

const topMovements = {
  [constants.TOP_LEFT]: constants.TOP_LEFT,
  [constants.TOP_RIGHT]: constants.TOP_RIGHT,
  [constants.TOP]: constants.TOP,
};

const bottomMovements = {
  [constants.BOTTOM_LEFT]: constants.BOTTOM_LEFT,
  [constants.BOTTOM_RIGHT]: constants.BOTTOM_RIGHT,
  [constants.BOTTOM]: constants.BOTTOM,
};

function maxCarry(body) {
  return body.reduce((acc, bodyPart) => {
    if (bodyPart.type === constants.CARRY) {
      return acc + constants.CARRY_CAPACITY;
    }
    return acc;
  }, 0);
}

function maxPower(body) {
  return body.reduce((acc, bodyPart) => {
    if (bodyPart.type === constants.WORK) {
      return acc + constants.HARVEST_POWER;
    }

    return acc;
  }, 0);
}

function predictGameObjects(gameObjects, intent) {
  switch(intent.type) {
    case TICK_END: {
      return Object.entries(gameObjects).reduce((acc, [id, gameObject]) => {
        let newGameObject = gameObject;
        if (gameObject.type === SOURCE && gameObject.ticksToRegeneration !== undefined) {
          const newTTR = gameObject.ticksToRegeneration > 1 ? gameObject.ticksToRegeneration - 1 : 0;
          newGameObject = {
            ...gameObject,
            ticksToRegeneration: newTTR,
          };
        }
        return {
          ...acc,
          [id]: newGameObject,
        };
      }, {});
    }
    case HARVEST: {
      const target = gameObjects[intent.targetId];
      const actor = gameObjects[intent.objectId];
      const actorMaxCarry = maxCarry(actor.body);
      const actorCurrentCarry = Object.values(actor.carry).reduce((acc, val) => acc + val);
      const actorAvailableCarry = actorMaxCarry - actorCurrentCarry;
      const maxTransfer = Math.min(maxPower(actor.body), actorAvailableCarry, target.energy);
      return {
        ...gameObjects,
        [intent.objectId]: {
          ...gameObjects[intent.objectId],
          carry: {
            energy: actor.carry.energy + maxTransfer,
          },
        },
        [intent.targetId]: {
          ...gameObjects[intent.targetId],
          energy: Math.max(target.energy - maxPower(actor.body), 0),
        },
      };
    }
    case REPAIR: {
      return {
        ...gameObjects,
        [intent.objectId]: {
          ...gameObjects[intent.objectId],
          carry: {
            energy: actor.carry.energy - 1,
          },
        },
      };
    }
    case TRANSFER: {
      return {
        ...gameObjects,
        [intent.objectId]: {
          ...gameObjects[intent.objectId],
          carry: {
            energy: 0,
          },
        }
      };
    }
    case constants.MOVE: {
      let x = gameObjects[intent.objectId].x;
      let y = gameObjects[intent.objectId].y;
      if (leftMovements[intent.direction]) x--;
      if (rightMovements[intent.direction]) x++;
      if (topMovements[intent.direction]) y--;
      if (bottomMovements[intent.direction]) y++;
      return {
        ...gameObjects,
        [intent.objectId]: {
          ...gameObjects[intent.objectId],
          x,
          y,
        }
      };
    }
    default:
      return gameObjects;
  }
}

function predictNextState(serializedState, intents) {
  return intents.reduce((acc, intent) => {
    return {
      rooms: predictRooms(acc.rooms, intent),
      gameObjects: predictGameObjects(acc.gameObjects, intent),
    };
  }, serializedState);
}

function addIntent(intent) {
  Memory.serializer[Game.time].intents.push(intent);
}

function extendPrototypes() {
  if (!Creep.prototype._serializerExtended) {
    Creep.prototype._serializerExtended = true;
    const originalMove = Creep.prototype.move;
    Creep.prototype.move = function move(direction) {
      const result = originalMove.apply(this, arguments);
      if (result === 0) {
        addIntent({
          objectId: this.id,
          type: constants.MOVE,
          direction,
        });
      }
      return result;
    }

    const originalHarvest = Creep.prototype.harvest;
    Creep.prototype.harvest = function harvest(target) {
      const result = originalHarvest.apply(this, arguments);
      if (result === 0) {
        addIntent({
          objectId: this.id,
          targetId: target.id,
          type: HARVEST,
        });
      }
      return result;
    };

    const originalPickup = Creep.prototype.pickup;
    Creep.prototype.pickup = function pickup(target, resourceType, amount) {
      const result = originalPickup.apply(this, arguments);
      if (result === 0) {
        addIntent({
          type: PICKUP,
          objectId: this.id,
          targetId: target.id,
          resourceType,
          amount,
        });
      }
      return result;
    };

    const originalWithdraw = Creep.prototype.withdraw;
    Creep.prototype.withdraw = function withdraw(target, resourceType, amount) {
      const result = originalWithdraw.apply(this, arguments);
      if (result === 0) {
        addIntent({
          type: WITHDRAW,
          objectId: this.id,
          targetId: target.id,
          resourceType,
          amount,
        });
      }
      return result;
    };

    const originalUpgradeController = Creep.prototype.upgradeController;
    Creep.prototype.upgradeController = function upgradeController(target) {
      const result = originalUpgradeController.apply(this, arguments);
      if (result === 0) {
        addIntent({
          type: UPGRADE_CONTROLLER,
          objectId: this.id,
          targetId: target.id,
        });
      }
      return result;
    };

    const originalTransfer = Creep.prototype.transfer;
    Creep.prototype.transfer = function transfer(target, resourceType, amount) {
      const result = originalTransfer.apply(this, arguments);
      if (result === 0) {
        addIntent({
          type: TRANSFER,
          objectId: this.id,
          targetId: target.id,
          amount,
          resourceType,
        });
      }
      return result;
    }

    const originalRepair = Creep.prototype.repair;
    Creep.prototype.repair = function repair(target) {
      const result = originalRepair.apply(this, arguments);
      addIntent({
        type: REPAIR,
        objectId: this.id,
        targetId: target.id,
      });
      return result;
    }

    const originalDrop = Creep.prototype.drop;
    Creep.prototype.drop = function drop(resourceType, amount) {
      const result = originalDrop.apply(this, arguments);
      if (result === 0) {
        addIntent({
          type: DROP,
          objectId: this.id,
          resourceType,
          amount,
        });
      }
      return result;
    }
  }
}

function playground(loop) {
  extendPrototypes();
  if (!Memory.serializer) Memory.serializer = {};
  Memory.serializer[Game.time] = {
    state: serializeGame(),
    intents: []
  };
  const loopResult = loop();
  Memory.serializer[Game.time].intents.push({
    type: TICK_END,
  });

  Object.keys(Memory.serializer).forEach((tickString) => {
    const tick = parseInt(tickString, 10);
    if (tick < Game.time - 10) {
      delete Memory.serializer[tickString];
    }
  });

  return loopResult;
}

module.exports = {
  playground,
  predictNextState,
};