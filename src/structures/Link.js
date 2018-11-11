import './_base';

class Link extends StructureLink {
  performRole() {
    const shouldTransfer = !this.isControllerLink() && !this.cooldown;
    const controllerLink = this.room.getControllerLink();
    const controllerLinkNeedsEnergy = controllerLink && controllerLink.energy < 700;
    if (shouldTransfer && controllerLinkNeedsEnergy) {
      this.transferEnergy(this.room.getControllerLink());
    }
  }

  isSourceLink() {
    return !this.isControllerLink();
  }

  isControllerLink() {
    const storage = this.room.getStorage();
    if (!storage) return false;
    return this.pos.inRangeTo(storage, 2);
  }

  needsEnergy() {
    const closestContainer = this.pos.findClosestByRange(this.room.getContainers());
    if (this.pos.getRangeTo(closestContainer) > 2) {
      return false;
    }
    return this.energy < this.energyCapacity;
  }
}

export default Link;
