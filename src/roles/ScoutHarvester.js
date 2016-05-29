import Base from './Base';

export default class ScoutHarvester extends Base {
  performRole() {
    if (this.findUnvisitedScoutFlags().length > 0) {
      this.scout();
    } else {
      const sourcesNeedingHarvesters = this.room.getSourcesNeedingHarvesters();
      if (sourcesNeedingHarvesters.length > 0) {
        this.memory.role = 'harvester';
        this.memory.oldRole = 'scoutharvester';
        this.memory.source = sourcesNeedingHarvesters[0].id;
      }
    }
  }
}
