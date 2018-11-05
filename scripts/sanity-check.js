const expect = require('expect');
const { predictNextState } = require('../src/playground');
const fetchTestCases = require('./fetchTestCases');

fetchTestCases().then((testCaseMap) => {
  const testCases = Object.keys(testCaseMap).map((key) => {
    return {
      tickTime: parseInt(key),
      ...testCaseMap[key],
    };
  });

  testCases.forEach(({ state, intents, tickTime }, index) => {
    if (index === testCases.length - 1) return;
    const predictedNextState = predictNextState(state, intents);
    const actualNextState = testCaseMap[tickTime + 1].state;

    Object.entries(predictedNextState.gameObjects).forEach(([objectId, predictedGameObject]) => {
      const actualGameObject = actualNextState.gameObjects[objectId];
      try {
        expect(predictedGameObject).toEqual(actualGameObject);
      } catch(e) {
        console.log(e.message);
        console.log('failed diff for', objectId);
        console.log('prev state', state.gameObjects[objectId]);
        console.log('new state', actualGameObject);
        console.log('tick time', tickTime);
        console.log('intents from', intents.filter(intent => intent.objectId === objectId));
        const upon = intents
          .filter(intent => intent.targetId === objectId)
          .map((intent) => {
            return {
              ...intent,
              actor: state.gameObjects[intent.objectId],
            };
          });
        console.log('intents upon', JSON.stringify(upon, null, 2));
        process.exit();
      }
    });
  });
});
