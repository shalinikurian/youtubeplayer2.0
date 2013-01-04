// Events.
var vent = _.extend({} , Backbone.Events);

var YoutubePlayerView = Backbone.View.extend({
  initialize: function(options) {
    this.apiReady = false;
    this.panelShowing = 0;
    this.vent = options.vent;
    _.bindAll(this, 'youTubePlayerAPIReady', 'playSong', 'playerReady', 'stateChanged', 'videoEnded', 'apiError');

    // Add Youtube script.
    this.vent.bind("YouTubePlayerAPIReady", this.youTubePlayerAPIReady);
    var tag = document.createElement('script');
    tag.src = "http://www.youtube.com/player_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  },

  youTubePlayerAPIReady : function() {
  this.apiReady = true;
  },

  playSong: function(song) {
   if (this.apiReady) {
      var songUrl = song.get("song_id");
      if (this.player) {
        this.player.loadVideoById(songUrl)
      } else this.player = new YT.Player('video_player_container', {
          width: 400,
          height: 280,
          videoId: songUrl,
          events: {
            'onReady': this.playerReady,
            'onPlaybackQualityChange': this.playerReady,
            'onStateChange': this.stateChanged,
            'onError': this.errorz
          }
        });
      } else alert("api not ready");
  },

    playerReady: function(event) {
      console.log("In playerReady function ready to play")
       this.player.playVideo();
    },

    stateChanged: function(event) {
      if (event.data == YT.PlayerState.ENDED) {
        this.videoEnded();
      }
    },

    videoEnded: function() {
      // Let other parties know that a video ended.
      console.log("video ended");
    },

    apiError: function(error) {
      alert("Error is " + error);
    }
  });


// Pretty print duration for display.
var durationForDisplay = function(secs){
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


// Models.

// Song model used for both search result song item and playlist song item.
var Song = Backbone.Model.extend({});


// Playlist model.
var Playlist = Backbone.Model.extend({
  defaults: {
    name: "New Playlist"
  },

   // Make new song collection and fetch songs in playlist from local store.
  initialize: function() {
    this.songs = new Songs();
    if (this.id) {
      this.songs.setLocalStore(this.id);
      this.songs.fetch();
    }
  },

  // Add song to playlist.

  addSong: function(songToAdd) {
    var song = new Song(songToAdd.toJSON());  // Make new song model.
    song.set('order', this.songs.getNextOrder());  // Set order of new song.
    // Do we need to add playlist?
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


// Views.

var SearchResultsView = Backbone.View.extend({
   // Set max results for search view and clear search bar.

  initialize: function(args) {
    this.$searchBar = $('#search_bar');
    this.$searchResultsContainer = $('#search_results_view');
    this.maxResults = args.maxResults | 10;
    this.vent = args.vent;
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
      this.fetchQueryFromYoutube(query);
    }
  },

  // TODO(shalinikurian): We should treat the fetching as a rest API and make it part of the collection, instead of a discreet function.
  fetchQueryFromYoutube: function(query) {
    var youtubeUrl = "https://gdata.youtube.com/feeds/api/videos?q="+query+"&max-results="+this.maxResults+"&v=2&alt=jsonc&callback=?";
    $.getJSON(youtubeUrl, function(data){
      this.populateSearchResults(data);
    }.bind(this));
  },

 // Hide playlist view, add songs from search results to view.
  populateSearchResults: function(data) {
    $('#playlist_view').hide();
    this.$searchResultsContainer.html('');
    this.$searchResultsContainer.show();
    $.each(data.data.items, function(index, song){
      this.addSong(song);
    }.bind(this));
  },

  // Make song model. make search result song view and append to search results.
  addSong: function(songItem) {
    var song = new Song({
      'title' : songItem.title,
      'thumbnail' : songItem.thumbnail.sqDefault,
      'duration': this.durationForDisplay(songItem.duration),
      'actual_duration': songItem.duration,
      'song_id' : songItem.id,
    });

    var searchResultSongView = new SearchResultSongView({
      model: song
    });

    this.$searchResultsContainer.append(searchResultSongView.render().el);
  },

  // Pretty print duration for search result item.
  durationForDisplay: function(secs){
    var hrs = Math.floor(secs/3600);
    var rem = secs % 3600;
    var min = Math.floor(rem/60);
    secs = rem % 60;
    var str = "";
    if (hrs > 0 ) {
      str = hrs.toString() + ":";
    }
    var secsStr = secs.toString();
    if (secs < 10 ) {
      secsStr = '0' + secsStr;
    }
    str = str + min.toString() +":"+ secsStr;
    return str;
  }

});


  // Search result song view.
var SearchResultSongView = Backbone.View.extend({

  // Make search results draggable and initialize view with search result template.
  initialize: function() {
    this.$searchResultItem = $(this.el);
    this.$searchResultItem.addClass('search_result_item');
    this.template = _.template($('#search_result_template').html());
    $(this.el).draggable({
      revert: true,
      helper: function() {
        return $("<div class='song-draggable'>"+this.model.get('title')+"</div>");
      }.bind(this),
      appendTo: 'body',
      cursorAt: { bottom: 0 }
    });
    $(this.el).data("song-model", this.model);
  },

  render: function() {
    this.$searchResultItem.html(this.template(this.model.toJSON()));
    return this;
  },

  events: {
    'click .thumbnail' : 'playSong'
  },

  playSong: function() {
    YoutubePlayer.playSong(this.model)
  }
});


// Playlist view on left nav.
var PlayListsView = Backbone.View.extend({
  el : '#left_nav',

  // Make playlist sortable and render view.
  initialize: function(args){
    this.vent = args.vent;
    this.$textBox = $('#new_playlist_name');
    this.$addPlaylistButton = $('#add_playlist');
    this.$playlists = $('#playlists');
    this.$playlists.sortable({
      axis: 'y',
      helper: "clone"
    });
    this.render();
  },

  events: {
    'click #add_playlist' : 'showNewPlayListTextBox',
    'keyup #new_playlist_name' : 'addNewPlayList',
    'sortupdate #playlists' : 'reorderPlaylists'
  },

  render: function() {
    _.each(playlistsCollection.models, function(playlist){
      this.appendPlaylistToView(playlist);
    }.bind(this));
  },

  //Reorder playlist order for sortable.

  reorderPlaylists: function(e, ui) {
   var playlistsOrder = $(e.target).sortable('toArray');
   playlistsCollection.reorderAfterSorting(playlistsOrder);
  },

  // Display new playlist text box //TODO consider replacing the new playlist button with the text button spotify style.
  showNewPlayListTextBox: function(e) {
    this.$textBox.val('');
    this.toggleNewPlaylistView();
    this.$textBox.focus();
  },

  toggleNewPlaylistView: function(e) {
    this.$addPlaylistButton.toggle();
    this.$textBox.toggle();
  },

  // Add new playlist to collection of playlists and add to playlist view.
  addNewPlayList: function(e) {
    if (e.which == 27) {
      this.toggleNewPlaylistView();
    }

    if (e.keyCode == 13) {
      this.toggleNewPlaylistView();
      var playlistName = this.$textBox.val();
      var order = playlistsCollection.getNextOrder();
      playlistsCollection.create({
        name: playlistName,
        order: order
      });
      playlistsCollection.last().save();
      this.appendPlaylistToView(playlistsCollection.last());
    }
  },


  // Add playlist to playlists view.
  appendPlaylistToView: function(playlist) {
    var playlistView = new PlayListView({
      model: playlist,
      vent: vent
    });

    this.$playlists.append(playlistView.render().el);
  }
});


var modes = {
  shuffle: 0,
  repeatOne: 1,
  repeatAll: 2,
  none: 3
}

var generateRandomNumber = function(start, end) {
  return Math.floor(Math.random() * (end - start) + start)
}

// Single playlist view.
var PlayListView = Backbone.View.extend({
  tagName : 'div',

  className: 'playlistItem',

  // Make playlist item droppable.
  initialize: function(args) {
    this.vent = args.vent;
    this.currentPlayingPlaylist = false;

    // Set the mode to none.
    this.setMode(modes.none);
    this.currentlyPlayingSong = null;

    _.bindAll(this, 'songDeleted', 'remove', 'setCurrentPlayingPlaylist', 'playParticularSong');
    this.vent.bind("songClicked", this.playParticularSong);
    this.vent.bind("switchedCurrentPlayingPlaylist", this.setCurrentPlayingPlaylist);
    this.vent.bind("songDeleted", this.songDeleted);
    this.model.bind('destroy', this.remove);
    
    this.playlistView = $('#playlist_view');
    $(this.el).attr('id', this.model.id);
    
    this.$template = _.template($('#playlist_template').html());
    
    $(this.el).droppable({
      accept: '.search_result_item',
      hoverClass: "ui-state-active",
      drop: function(event, ui){
        var song = $(ui.draggable).data("song-model");
        this.model.addSong(song);
        ui.helper.hide();
      }.bind(this)
    });

  },
  
  songDeleted: function() {
    if (this.currentPlayingPlaylist) {
      this.model.songs.reorderAfterDelete();
    }
  },
  
    
  events: {
  'click .delete' : 'deletePlaylist',
  'click' : 'switchToPlaylist',
  // Add click handler for changing mode.
  },


  // Delete playlist , unbind events and remove view, reorder playlists after delete.
  deletePlaylist: function(e){
    this.unbind();
    this.model.destroy();
    playlistsCollection.reorderAfterDelete();
  },

  remove: function() {
    $(this.el).remove();
  },

  render: function() {
    $(this.el).html(this.$template(this.model.toJSON()));
    return this;
  },

  setMode: function (mode) {
    this.mode = mode
  },

  setCurrentPlayingPlaylist: function(isCurrentlyPlaying) {
    this.currentPlayingPlaylist = isCurrentlyPlaying;
  },
  
  setCurrentPlayingPlaylist: function(currentPlaylistId) {
    this.currentPlayingPlaylist = (currentPlaylistId == this.model.get('id'))
  },

  playParticularSong: function(song) {
    this.currentlyPlayingSong = song.get('order');
    YoutubePlayer.playSong(song);
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
          this.currentlyPlayingSong = generateRandomNumber(1, playlistLength);
          var newSong = this.model.songs[this.currentlyPlayingSong]
          YoutubePlayer.playSong(newSong)
          break;
        case modes.repeatOne:
          break;
      }
    }
  },

  playSequentialSong: function(playlistLength) {
    if (this.currentlyPlayingSong == null) {
      var newSong = this.model.songs.first()
      this.currentlyPlayingSong = newSong.get('order')
      YoutubePlayer.playSong(newSong)
    } else if (this.currentlyPlayingSong < playlistLength) {
      this.currentlyPlayingSong += 1;
      var newSong = this.model.songs[this.currentlyPlayingSong]
      YoutubePlayer.playSong(newSong)
    } else if (this.mode == modes.repeatAll) {
      this.currentlyPlayingSong = 1;
      var newSong = this.model.songs[this.currentlyPlayingSong]
      YoutubePlayer.playSong(newSong)
    }
  },

  // Show playlist view in middle nav.

  switchToPlaylist: function() {
    this.vent.trigger('switchedCurrentPlayingPlaylist', this.model.get('id'));
    // Hide search results.
    $('#search_results_view').hide();
    // Show playlist view.
    this.showPlayList();
    this.playNextSong();
  },

   // Get templates for playlist information. render views.
  showPlayList: function() {
    this.playlistView.html('').show();
    var noOfSongs = this.model.songs.length;
    var playlistTemplate = (noOfSongs == 0) ? (_.template($('#playlist_info_template_no_songs').html())) : (_.template($('#playlist_info_template').html()));
    var variables = (noOfSongs == 0) ? {} : {"thumbnail1": this.model.songs.last().get('thumbnail')};
    this.playlistView.append(playlistTemplate(variables));
    // General info.
    var generalInfoTemplate = _.template($('#playlist_info_template_general').html());
    variables = {
      "title":this.model.get('name'),
      "noOfSongs" : this.model.songs.length ,
      "duration": (noOfSongs == 0 ) ? '0 s' : this.model.playlistDuration()
    };
    this.playlistView.append(generalInfoTemplate(variables));
    // Add song list.
    this.addSongList();
  },
  
  addSongList: function() {
    var songListTemplate = _.template($('#songs_list').html());
    this.playlistView.append(songListTemplate());
    this.songsContainer = $('#songs');
    _.each(this.model.songs.models, function(song){
      //TODO(shalinikurian): Refactor this so that the songs are not responsible for reordering.
      var songView = new SongView({
        model: song,
        vent: vent
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
    
  }

});

// Song view.
var SongView = Backbone.View.extend({

  events: {
    'click' : 'playSong',
    'click .delete' : 'deleteSong'
  },

  initialize: function(args) {
    var evenRow = (this.model.get('order') % 2 == 0 );
    this.vent = args.vent;
    if (evenRow) $(this.el).addClass('even_row');
    else $(this.el).addClass('odd_row');
    $(this.el).attr('id', this.model.id);
  },
  
  render: function() {
    var songTemplate = eachSongTemplate = _.template($('#playlist_song').html());
    var songVariables = {"track": this.model.get('title'), "duration":this.model.get('duration'), "thumbnail": this.model.get('thumbnail')};
    $(this.el).html(eachSongTemplate(songVariables));
    return this;
  },

  // On delete song , unbind event , remove view and reorder playlist song collection order.
  deleteSong: function(evt) {
    this.remove();
    this.unbind();
    //reorder songs after delete
    this.model.destroy();
    this.vent.trigger('songDeleted');
  },
  
  playSong: function(evt) {
    this.vent.trigger("songClicked", this.model);
  }
});


// Collections.

var Songs = Backbone.Collection.extend({
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
      var song = this.get(id);
      song.set('order', order++);
      song.save();
    }.bind(this));
  },
  
  comparator: function(song) {
    return song.get('order');
  }
});

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

  function onYouTubePlayerAPIReady() {
    vent.trigger("YouTubePlayerAPIReady");
  }

//Initialize the application
function appInit() {
  window.searchResultsView = new SearchResultsView({el:'body', vent:vent, maxResults:10});
  window.playlistsCollection = new PlayListCollection;
  playlistsCollection.fetch();
  window.playListsView = new PlayListsView({vent: vent});
  window.YoutubePlayer = new YoutubePlayerView({vent: vent})
}

$(document).ready(function() {
  appInit();
});
