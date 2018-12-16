import { STRUCTURE_CONTROLLER } from '../utils/constants';

export default class Controller extends StructureController {
  static structureType = STRUCTURE_CONTROLLER;

  needsEnergy() {
    return true;
  }
}