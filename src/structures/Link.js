import './_base';

class Link extends StructureLink {
  performRole() {
    if (this.isControllerLink() || this.cooldown) return;
    this.room.getControllerLinks().find((controllerLink) => {
      if (controllerLink.energy < 700) {
        this.transferEnergy(controllerLink);
        return true;
      }
    });
  }

  isSourceLink() {
    return !this.isControllerLink();
  }

  isControllerLink() {
    return this.room.determineControllerLinkLocations().find(pos => {
      return pos.isEqualTo(this.pos);
    });
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
