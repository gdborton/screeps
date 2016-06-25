import Builder from '../roles/Builder';
import Claimer from '../roles/Claimer';
import Courier from '../roles/Courier';
import Harvester from '../roles/Harvester';
import Mailman from '../roles/Mailman';
import RemoteHarvester from '../roles/RemoteHarvester';
import Reserver from '../roles/Reserver';
import RoadWorker from '../roles/RoadWorker';
import Scout from '../roles/Scout';
import ScoutHarvester from '../roles/ScoutHarvester';
import Upgrader from '../roles/Upgrader';
import Wanderer from '../roles/Wanderer';

const roleMap = {
  builder: Builder,
  claimer: Claimer,
  courier: Courier,
  harvester: Harvester,
  mailman: Mailman,
  remoteharvester: RemoteHarvester,
  reserver: Reserver,
  roadworker: RoadWorker,
  scout: Scout,
  scoutharvester: ScoutHarvester,
  upgrader: Upgrader,
  wanderer: Wanderer,
};

export default roleMap;
