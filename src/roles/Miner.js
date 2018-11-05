import Base from './Base';

export default class extends Base {
  performRole() {
    const source = this.targetSource();
    this.moveToAndHarvest(source);
  }
}
