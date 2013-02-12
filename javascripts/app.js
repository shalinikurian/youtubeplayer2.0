define([
  'jQuery', 
  'jQueryUi',
  'underscore',
  'backbone',
  'eventBus',
  'views/YoutubePlayerView',
  'views/SearchResultsView',
  'views/PlayListsView',
], function($, $ui, _, Backbone,vent, YoutubePlayer, SearchResultsView, PlayListsView) {
  var initialize = function() {
    YoutubePlayer.initialize();
    SearchResultsView.initialize();
    PlayListsView.initialize();
  };
  
  return {
    initialize: initialize
  };
});
