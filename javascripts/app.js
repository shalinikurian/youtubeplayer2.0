define([
  'jQuery', 
  'jQueryUi',
  'underscore',
  'backbone',
  'eventBus',
  'views/SearchResultsView',
  'views/YoutubePlayerView'
], function($, $ui, _, Backbone,vent, SearchResultsView, YoutubePlayer) {
  var initialize = function() {
    console.log("initializing app");
    SearchResultsView.initialize();
    YoutubePlayer.initialize();
  };
  
  return {
    initialize: initialize
  };
});
