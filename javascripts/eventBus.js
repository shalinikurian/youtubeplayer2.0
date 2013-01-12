define([
  'backbone',
], function(Backbone){
  console.log("initializing events");
  var vent = _.extend({} , Backbone.Events);
  return vent;
});
