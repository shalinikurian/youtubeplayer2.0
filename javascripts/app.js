define([
  'jQuery',
  'jQueryUi',
  'underscore',
  'backbone',
  'views/SearchResultsView',
], function($, $ui, _, Backbone, SearchResultsView) {
  var initialize = function() {
    console.log("initialize");
    var searchResultsView = new SearchResultsView();
  };
  
  return {
    initialize: initialize
  };
});
