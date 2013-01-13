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
    function onYouTubePlayerAPIReady() {
      vent.trigger("YouTubePlayerAPIReady");
    }
    console.log("initializing app");
    YoutubePlayer.initialize();
    SearchResultsView.initialize();
    //PlayListsView.initialize();
  };
  
  return {
    initialize: initialize
  };
});
