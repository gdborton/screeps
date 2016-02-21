Flag.prototype.work = function() {
  if (this.name.toLowerCase().indexOf('build') !== -1 && this.room.getControllerOwned()) {
    var parts = this.name.split('_');
    var target = parts[parts.length - 1];
    var shouldBuild = false;

    if (target === STRUCTURE_SPAWN) {
      shouldBuild = true;
    } else if (target === STRUCTURE_STORAGE && this.room.controller.level === 4) {
      shouldBuild = true;
    } else if (target === STRUCTURE_LINK && this.room.controller.level === 5) {
      shouldBuild = true;
    }

    if (shouldBuild) {
      var result = this.room.createConstructionSite(this.pos.x, this.pos.y, target);
      if (result === 0) {
        this.remove();
      }
    }
  }
};
