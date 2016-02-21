export default function validExitCoord(coord) {
  return ((coord.x === 2 || coord.x === 47) && coord.y < 48 && coord.y > 1) || ((coord.y === 2 || coord.y === 47) && coord.x < 48 && coord.x > 1);
};
