import './_base';

class Link extends StructureLink {
  performRole() {
    const shouldTransfer = !this.isControllerLink() && !this.cooldown;
    const controllerLink = this.room.getControllerLink();
    const controllerLinkNeedsEnergy = controllerLink && controllerLink.energy < 100;
    if (shouldTransfer && controllerLinkNeedsEnergy) {
      this.transferEnergy(this.room.getControllerLink());
    }
  }
}

export default Link;
