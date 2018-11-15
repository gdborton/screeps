import Base from '../roles/Base';
import Builder from '../roles/Builder';
import Claimer from '../roles/Claimer';
import Courier from '../roles/Courier';
import Distributor from '../roles/Distributor';
import Gatherer from '../roles/Gatherer';
import Harvester from '../roles/Harvester';
import Mailman from '../roles/Mailman';
import RemoteCourier from '../roles/RemoteCourier';
import RemoteHarvester from '../roles/RemoteHarvester';
import Reserver from '../roles/Reserver';
import RoadWorker from '../roles/RoadWorker';
import Scout from '../roles/Scout';
import ScoutHarvester from '../roles/ScoutHarvester';
import Upgrader from '../roles/Upgrader';
import Wanderer from '../roles/Wanderer';
import Miner from '../roles/Miner';

/**
 * These are run in order of importance. The first creep that says yes, gets
 * built. Generally emergency type Roles should be placed higher on the list.
 *
 * Setup in an object for legacy purposes, needs a refactor.
 */
const roleMap = {
  harvester: Harvester,
  miner: Miner,
  distributor: Distributor,
  courier: Courier,
  builder: Builder,
  upgrader: Upgrader,
  mailman: Mailman,
  gatherer: Gatherer,
  remotecourier: RemoteCourier,
  remoteharvester: RemoteHarvester,
  reserver: Reserver,
  scout: Scout,
  scoutharvester: ScoutHarvester,
  claimer: Claimer,
  roadworker: RoadWorker,
  wanderer: Wanderer,
  base: Base,
};

export const roleList = [
  Harvester,
  Miner,
  Distributor,
  Courier,
  Builder,
  Upgrader,
  Mailman,
  Gatherer,
  RemoteCourier,
  RemoteHarvester,
  Reserver,
  Scout,
  ScoutHarvester,
  Claimer,
  RoadWorker,
  Wanderer,
  Base,
];

export default roleMap;
