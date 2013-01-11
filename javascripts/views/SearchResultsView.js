define([
  'jQuery',
  'underscore',
  'backbone',
], function($, _, Backbone){
  var SearchResultsView = Backbone.View.extend({
    initialize: function(){
      console.log("in searchview");
    }
  });
  
  return SearchResultsView;
});