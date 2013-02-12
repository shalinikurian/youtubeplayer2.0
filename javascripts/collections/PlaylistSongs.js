define([
  'collections/SongsCollection',
  'models/Song',
  'libs/backbone/backbone-localStorage'
], function(SongsCollection, Song, Store){
  var PlaylistSongs = SongsCollection.extend({
    model : Song,
    localStorage: new Store(""),
  
    setLocalStore: function (id) {
      var localKey = "playlist"+id;
      this.localStorage = new Store(localKey);  // Window needed?
    },
  
    getNextOrder : function() {
      if (this.length == 0) return 1;
      return this.last().get('order') + 1;
    },
    
    reorderAfterDelete: function() {
      var order = 1;
      _.each(this.models, function(song){
        song.set('order', order++);
        song.save();
      }.bind(this));
    },
    reorderAfterSorting: function(orderedSongsIds) {
      var order = 1;
      _.each(orderedSongsIds, function(id){
        var song = this.find(function(song){
          return song.get('id') == id;
        });
        song.set('order', order++);
        song.save();
      }.bind(this));
    },
    
    comparator: function(song) {
      return song.get('order');
    }
  });
  
  return PlaylistSongs;
});
