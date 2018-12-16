/* @flow */
import { Resource } from 'screeps-globals';
import { RESOURCE_ENERGY } from './utils/constants';

Object.assign(Resource.prototype, {
  availableEnergy() {
    if (this.resourceType === RESOURCE_ENERGY) return this.amount;
    return 0;
  }
});
