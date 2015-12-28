Array.prototype.filter = function (callback) {
  var results = [];
  var arr = this;
  for (var iterator = 0; iterator < arr.length; iterator++) {
    if (callback(arr[iterator], iterator, arr)) {
      results.push(arr[iterator]);
    }
  }
  return results;
};
