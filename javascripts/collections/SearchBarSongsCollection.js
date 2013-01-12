define([
  'collections/SongsCollection',
  'models/SearchViewSong'
], function(SongsCollection, SearchViewSong){
  var SearchBarSongsCollection = SongsCollection.extend({
    model: SearchViewSong,
    
    initialize: function() {
      this.query="";
      this.maxResults = 10;
    },
    
    url: function() {
      return "https://gdata.youtube.com/feeds/api/videos?q="+this.query+"&max-results="+this.maxResults+"&v=2&alt=jsonc&callback=?";
    },
  
    setQuery: function(query) {
      this.query = query;
    },
  
    sync: function(method, model, options) {
        var params = _.extend({
              type: 'GET',
              dataType: 'json',
              url: model.url(),
              processData: false
          }, options);
  
      return $.ajax(params);
    },

    parse: function(response) {
      return response.data.items;
    }
  });
  
  return SearchBarSongsCollection;
});
