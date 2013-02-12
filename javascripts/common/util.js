define([], function(){
  var generateRandomNumber = function(start, end) {
    return Math.floor(Math.random() * (end - start + 1) + start)
  }
  return {
    generateRandomNumber: generateRandomNumber
  }
});
