define([
  'backbone',
  'collections/PlaylistSongs',
  'models/Song'
], function(Backbone, PlaylistSongs, Song){
  var Playlist = Backbone.Model.extend({
    defaults: {
      name: "New Playlist"
    },
  
     // Make new song collection and fetch songs in playlist from local store.
    initialize: function() {
      this.songs = new PlaylistSongs();
      this.getSongs();
    },
  
    getSongs: function() {
      if (this.id) {
        this.songs.setLocalStore("songs"+this.id);
        this.songs.fetch();
      }
    },
    // Add song to playlist.
    addSong: function(songToAdd) {
      this.getSongs();
      var song = new Song(songToAdd.toJSON());  // Make new song model.
      song.set('order', this.songs.getNextOrder());  // Set order of new song.
      // Add song to songs collection.
      this.songs.add(song);
      this.songs.last().save();
      },
  
    // Calculate and store duration for pretty print
    playlistDuration: function() {
      var totalDuration = 0;
      _.each(this.songs.models, function(song){
        totalDuration = totalDuration + song.get('actual_duration');
      }.bind(this));
      return this.durationForDisplay(totalDuration);
    },
    
    durationForDisplay : function(secs){
      var hrs = Math.floor(secs/3600);
      var rem = secs % 3600;
      var min = Math.floor(rem/60);
      secs = rem % 60;
      var str = "";
      if (hrs > 0 ) {
        str = hrs.toString() + " h ";
      }
      var secsStr = secs.toString();
      if (secs < 10 ) {
        secsStr = '0' + secsStr;
      }
      str = str + min.toString() + " m "+ secsStr + " s ";
      return str;
    }
  });
  
  return Playlist;

});
