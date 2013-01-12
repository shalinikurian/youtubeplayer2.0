define([
  'jQuery', 
  'jQueryUi',
  'underscore',
  'backbone',
  'views/SearchResultsView',
], function($, $ui, _, Backbone, SearchResultsView) {
  var initialize = function() {
    var searchResultsView = new SearchResultsView({el:'body', maxResults:10});
    //var YoutubePlayer = new YoutubePlayerView();
  };
  
  return {
    initialize: initialize
  };
});
