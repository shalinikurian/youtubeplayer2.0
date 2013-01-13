define([
  'backbone',
  'models/Playlist',
  'libs/backbone/backbone-localStorage'
], function(Backbone, Playlist, Store) {
  var PlayListCollection = Backbone.Collection.extend({
    model: Playlist,
    localStorage: new Store("playlists"),
  
    getNextOrder : function() {
      if (this.length == 0) return 1;
      return this.last().get('order') + 1;
    },
  
    reorderAfterDelete: function() {
      var order = 1;
      _.each(this.models, function(playlist){
        playlist.set('order', order++);
        playlist.save();
      }.bind(this));
    },
  
    reorderAfterSorting: function(orderedPlaylistsIds) {
      var order = 1;
      _.each(orderedPlaylistsIds, function(id){
        var playlist = this.get(id);
        playlist.set('order', order++);
        playlist.save();
      }.bind(this));
    },
  
    comparator: function(playlist) {
      return playlist.get('order');
    }
  });
  
  var playlistCollection = null;
  var initialize = function() {
    if (playlistCollection == null) playlistCollection = new PlayListCollection;
  };
  
  var getPlayListCollection = function() {
    playlistCollection.fetch();
    return playlistCollection;
  }
  return {
    initialize: initialize,
    getPlayListCollection: getPlayListCollection
  }
});
