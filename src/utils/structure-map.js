import Extension from '../structures/Extension';
import Link from '../structures/Link';
import Spawn from '../structures/Spawn';
import Tower from '../structures/Tower';

const structureMap = {
  [STRUCTURE_EXTENSION]: Extension,
  [STRUCTURE_LINK]: Link,
  [STRUCTURE_SPAWN]: Spawn,
  [STRUCTURE_TOWER]: Tower,
};

export default structureMap;
