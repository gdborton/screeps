const fs = require('fs');
const { ScreepsAPI } = require('screeps-api');

const TEST_CASE_PATH = './testcases.json';

module.exports = function fetchTestCases() {
  if (!fs.existsSync(TEST_CASE_PATH)) {
    const api = new ScreepsAPI({
      token: process.env.SCREEPS_TOKEN || require('./token.json'),
      protocol: 'https',
      hostname: 'screeps.com',
      port: 443,
      path: '/' // Do no include '/api', it will be added automatically
    });

    return api.memory.get('serializer', 'shard2').then((memory) => {
      fs.writeFileSync(TEST_CASE_PATH, JSON.stringify(memory.data, null, 2), 'utf8');
      return memory.data;
    });
  }

  return Promise.resolve(JSON.parse(fs.readFileSync(TEST_CASE_PATH)));
};
