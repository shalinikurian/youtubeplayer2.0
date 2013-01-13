define([
  'backbone',
  'collections/PlaylistSongs'
], function(Backbone, PlaylistSongs){
  var Playlist = Backbone.Model.extend({
    defaults: {
      name: "New Playlist"
    },
  
     // Make new song collection and fetch songs in playlist from local store.
    initialize: function() {
      this.songs = new PlaylistSongs();
      if (this.id) {
        this.songs.setLocalStore("songs"+this.id);
        this.songs.fetch();
      }
    },
  
    // Add song to playlist.
  
    addSong: function(songToAdd) {
      var song = new Song(songToAdd.toJSON());  // Make new song model.
      song.set('order', this.songs.getNextOrder());  // Set order of new song.
      // Add song to songs collection.
      this.songs.create(song);
      this.songs.last().save();
      },
  
    // Calculate and store duration for pretty print
    playlistDuration: function() {
      var totalDuration = 0;
      _.each(this.songs.models, function(song){
        totalDuration = totalDuration + song.get('actual_duration');
      }.bind(this));
      return durationForDisplay(totalDuration);
    }
  });
  
  return Playlist;

});
