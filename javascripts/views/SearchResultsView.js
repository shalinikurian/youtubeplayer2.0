define([
  'eventBus', 
  'collections/SearchBarSongsCollection',
  'views/SearchResultSongView'
], function(vent, SearchBarSongsCollection, SearchResultSongView){
  var SearchResultsView = Backbone.View.extend({
    initialize: function(args) {
      this.$searchBar = $('#search_bar');
      this.$searchResultsContainer = $('#search_results_view');
      this.maxResults = args.maxResults | 10;
      this.vent = vent;
      this.collection = new SearchBarSongsCollection();
      this.clearSearchBar();
    },
    
    events: {
      'keypress #search_bar' : 'searchQuery'
    },
  
    clearSearchBar : function() {
      this.$searchBar.val('');
    },
  
    searchQuery: function(e) {
      if (e.keyCode == 13) { // Enter.
        var query = this.$searchBar.val();
        //this.fetchQueryFromYoutube(query);
        this.collection.setQuery(query);
        this.collection.fetch({
          success: function() {
            this.populateSearchResults();
          }.bind(this)
        });
      }
    },

    // Hide playlist view, add songs from search results to view.
    populateSearchResults: function() {
      // Trigger an event so that playlists can react.
      this.vent.trigger("searchStarted")
      this.$searchResultsContainer.html('');
      this.$searchResultsContainer.show();
      this.collection.each(function(song){
         this.addSongToSearchView(song);
      }.bind(this));
    },

    addSongToSearchView: function(song) {
      var searchResultSongView = new SearchResultSongView({
        model: song
      });

      this.$searchResultsContainer.append(searchResultSongView.render().el);
    },
  });
  
  return {
    initialize: function() {
      new SearchResultsView({el:'body', maxResults:10});
    }
  }
});