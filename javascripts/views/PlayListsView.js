define([
  'backbone',
  'collections/PlayListCollection',
  'views/PlayListItemView',
  'models/Playlist'
], function(Backbone, playlistsCollection, PlayListItemView, Playlist){
  var PlayListsView = Backbone.View.extend({
    el : '#left_nav',
  
    // Make playlist sortable and render view.
    initialize: function(args) {
      this.currentlyPlayingPlaylist = null;
      this.$textBox = $('#new_playlist_name');
      this.$addPlaylistButton = $('#add_playlist');
      this.$playlists = $('#playlists');
      this.playlistsCollection = playlistsCollection.getPlayListCollection();
      this.$playlists.sortable({
        axis: 'y',
        connectWith: '#songs',
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
      this.playlistsCollection.each(function(playlist) {
        this.appendPlaylistToView(playlist);
      }.bind(this));
    },
  
    //Reorder playlist order for sortable.
    reorderPlaylists: function(e, ui) {
     var playlistsOrder = $(e.target).sortable('toArray');
     this.playlistsCollection.reorderAfterSorting(playlistsOrder);
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
        var order = this.playlistsCollection.getNextOrder();
        var playlist = new Playlist({
          name: playlistName,
          order: order
        });
        this.playlistsCollection.add(playlist);
        this.playlistsCollection.last().save();

        this.appendPlaylistToView(playlist);
      }
    },
  
  
    // Add playlist to playlists view.
    appendPlaylistToView: function(playlist) {
      var playlistView = new PlayListItemView({
        model: playlist
      });
  
      this.$playlists.append(playlistView.render().el);
    }
  });
  
  return {
    initialize: function() {
      playlistsCollection.initialize();
      new PlayListsView();
    }
  }
});
