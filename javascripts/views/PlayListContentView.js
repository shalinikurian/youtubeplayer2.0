define([
  'backbone',
  'common/Modes',
  'views/PlayListSongView',
  'eventBus',
  'views/YoutubePlayerView',
  'common/util'
], function(Backbone, modes, SongView, vent, YoutubePlayerView, utils){
  var PlayListContentView = Backbone.View.extend({
    el: '#playlist_view',
  
    initialize: function(args) {
      this.$el.empty();
      this.model = args.model;
      this.vent = vent;

      this.currentPlayingPlaylist = false;
      this.currentlyPlayingSong = null;

      this.youtubePlayer = YoutubePlayerView.getYoutubePlayer();
      this.setMode(modes.shuffle);
      _.bindAll(this);
      this.model.bind('destroy', this.remove);
      this.vent.bind("songDeleted", this.songDeleted);
      this.vent.bind("searchStarted", this.onSearchStart);
      this.vent.bind("songClicked", this.playParticularSong);
      this.vent.bind("videoEnded", this.onVideoEnd);
      this.vent.bind("switchedCurrentPlayingPlaylist", this.setCurrentPlayingPlaylist);

      this.showPlayList();
      this.playNextSong();
      
    },
  
    remove: function() {
      $(this.el).empty();
    },
    
    setMode: function (mode) {
      this.mode = mode
    },
    
    // Get templates for playlist information. render views.
    showPlayList: function() {
      var noOfSongs = this.model.songs.length;
      var playlistTemplate = (noOfSongs == 0) ? (_.template($('#playlist_info_template_no_songs').html())) : (_.template($('#playlist_info_template').html()));
      var variables = (noOfSongs == 0) ? {} : {"thumbnail1": this.model.songs.last().get('thumbnail')};
      this.$el.append(playlistTemplate(variables));
      // General info.
      var generalInfoTemplate = _.template($('#playlist_info_template_general').html());
      variables = {
        "title":this.model.get('name'),
        "noOfSongs" : this.model.songs.length ,
        "duration": (noOfSongs == 0 ) ? '0 s' : this.model.playlistDuration()
      };
      this.$el.append(generalInfoTemplate(variables));
      // Add song list.
      this.addSongList();
    },
    
    addSongList: function() {
      var songListTemplate = _.template($('#songs_list').html());
      this.$el.append(songListTemplate());
      this.songsContainer = $('#songs');
      _.each(this.model.songs.models, function(song){
        //TODO(shalinikurian): Refactor this so that the songs are not responsible for reordering.
        var songView = new SongView({
          model: song
          });
        this.songsContainer.append(songView.render().el);
      }, this);
      
      // Make the songs sortable.
      this.songsContainer.sortable({
        axis: 'y',
        update: function(e,ui) {
          var songsOrder = $(e.target).sortable('toArray');
          this.model.songs.reorderAfterSorting(songsOrder);
        }.bind(this)
      });
    },
  
    songDeleted: function() {
      this.model.songs.reorderAfterDelete();
      //re render TODO
    },
    
    playParticularSong: function(song) {
      this.currentlyPlayingSong = song.get('order') - 1;
      this.youtubePlayer.playSong(song);
    },
  
    onVideoEnd: function() {
      console.log("playlist content view listening to video ended")
      if (this.currentPlayingPlaylist) {
        console.log("playlist content view listening to video ended and this is the currently playlist playlist")
        this.playNextSong();
      }
    },
  
    playNextSong: function() {
      var playlistLength = this.model.songs.length
      if (playlistLength > 0) {
        switch (this.mode) {
          case modes.repeatAll:
          case modes.none:
            this.playSequentialSong(playlistLength)
            break;
          case modes.shuffle:
            var rand = 0;
            // Pick a random song that is not equal to the current one. If there is only one song in the playlist,
            // then there is no choice but to pick that one.
            console.log("Before " + this.currentlyPlayingSong)
            if (playlistLength != 1) {
              do {
              rand = utils.generateRandomNumber(0, playlistLength - 1);
              console.log(rand)
              } while (rand === this.currentlyPlayingSong);
            }
            console.log("After " + rand)
            this.currentlyPlayingSong = rand;
            var newSong = this.model.songs.models[this.currentlyPlayingSong]
            this.youtubePlayer.playSong(newSong)
            break;
          case modes.repeatOne:
            break;
        }
      }
    },
  
    playSequentialSong: function(playlistLength) {
      if (this.currentlyPlayingSong == null) {
        var newSong = this.model.songs.first()
        this.currentlyPlayingSong = newSong.get('order') - 1;
        this.youtubePlayer.playSong(newSong)
      } else if (this.currentlyPlayingSong < playlistLength - 1) {
        this.currentlyPlayingSong += 1;
        var newSong = this.model.songs.models[this.currentlyPlayingSong]
        this.youtubePlayer.playSong(newSong)
      } else if (this.mode == modes.repeatAll) {
        this.currentlyPlayingSong = 0;
        var newSong = this.model.songs.models[this.currentlyPlayingSong]
        this.youtubePlayer.playSong(newSong)
      }
    },

    setCurrentPlayingPlaylist: function(currentPlaylistId) {
      this.currentPlayingPlaylist = (currentPlaylistId == this.model.get('id'))
    },
  
  });
  
  return PlayListContentView;
});
