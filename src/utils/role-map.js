import Base from '../roles/Base';
import Bootstrapper from '../roles/Bootstrapper';
import Builder from '../roles/Builder';
import Claimer from '../roles/Claimer';
import Courier from '../roles/Courier';
import Distributor from '../roles/Distributor';
import Gatherer from '../roles/Gatherer';
import EmergencyHarvester from '../roles/EmergencyHarvester';
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
 */
export const roleList = [
  EmergencyHarvester,
  Miner,
  Distributor,
  Bootstrapper,
  Courier,
  Builder,
  Upgrader,
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

export default roleList.reduce((acc, Role) => {
  acc[Role.role] = Role;
  return acc;
},{});
