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
      this.currentlyPlayingSongIndex = null;

      this.youtubePlayer = YoutubePlayerView.getYoutubePlayer();
      this.setMode(modes.none);
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

    events: {
      'click .mode' : 'changeMode'
    },

    remove: function() {
      $(this.el).empty();
    },
    
    
    changeMode : function(evt){
      var $target = $(evt.target);
      var mode = $target.data("mode");
      $(".mode").removeClass("selected_mode");
      if (this.mode == mode) {
        this.setMode(modes.none);
      }
      else {
        this.setMode(mode);
        $target.toggleClass("selected_mode");
      }
    
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
      var modesTemplate = _.template($('#playlist_modes_template').html());
      this.$el.append(modesTemplate);
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
        containment: $("#songs"),
        update: function(e,ui) {
          var songsOrder = $(e.target).sortable('toArray');
          this.model.songs.reorderAfterSorting(songsOrder);
        }.bind(this)
      });
    },
  
    songDeleted: function() {
      this.model.songs.reorderAfterDelete();
      this.showPlaylist();
      //re render TODO
    },
    
    playParticularSong: function(song) {
      this.currentlyPlayingSongIndex = song.get('order') - 1;
      this.youtubePlayer.playSong(song);
    },
  
    onVideoEnd: function() {
      console.log("playlist content view listening to video ended")
      if (this.currentPlayingPlaylist) {
        this.playNextSong();
      }
    },
  
    playNextSong: function() {
      var playlistLength = this.model.songs.length;
      console.log("in play next song");
      console.log(this.mode);
      if (playlistLength > 0) {
        switch (this.mode) {
          case modes.shuffle:
            var rand = 0;
            // Pick a random song that is not equal to the current one. If there is only one song in the playlist,
            // then there is no choice but to pick that one.
            if (playlistLength != 1) {
              do {
              rand = utils.generateRandomNumber(0, playlistLength - 1);
              console.log(rand)
              } while (rand === this.currentlyPlayingSongIndex);
            }
            this.currentlyPlayingSongIndex = rand;
            var newSong = this.model.songs.models[this.currentlyPlayingSongIndex]
            this.currentlyPlayingSong = newSong;
            this.youtubePlayer.playSong(newSong)
            break;
          case modes.repeatOne:
            this.youtubePlayer.playSong(this.currentlyPlayingSong);
            break;
          case modes.repeatAll:
          case modes.none:
            this.playSequentialSong(playlistLength);
            break;
        }
      }
    },
  
    playSequentialSong: function(playlistLength) {
      var newSong;
      if (this.currentlyPlayingSongIndex == null) {
        newSong = this.model.songs.first();
        this.currentlyPlayingSongIndex = newSong.get('order') - 1;
      } else if (this.currentlyPlayingSongIndex < playlistLength - 1) {
        this.currentlyPlayingSongIndex += 1;
        newSong = this.model.songs.models[this.currentlyPlayingSongIndex]
      } else if (this.mode == modes.repeatAll) {
        this.currentlyPlayingSongIndex = 0;
        newSong = this.model.songs.models[this.currentlyPlayingSongIndex]
      }
      this.currentlyPlayingSong = newSong;
      this.youtubePlayer.playSong(newSong);
    },

    setCurrentPlayingPlaylist: function(currentPlaylistId) {
      this.currentPlayingPlaylist = (currentPlaylistId == this.model.get('id'))
    },
  
  });
  
  return PlayListContentView;
});
