define([
  'backbone',
  'eventBus',
  'collections/PlayListCollection',
  'views/PlayListContentView'
], function(Backbone, vent, playlistsCollection, PlayListContentView){
  var PlayListItemView = Backbone.View.extend({
    tagName : 'div',
    
    className: 'playlistItem',
    
    // Make playlist item droppable.
    initialize: function(args) {
      this.vent = vent;
      this.model = args.model;
      this.playlistsCollection = playlistsCollection.getPlayListCollection();

      this.currentPlayingPlaylist = false;
  
      this.currentlyPlayingSong = null;
  
      _.bindAll(this, 'remove','setCurrentPlayingPlaylist', 'onSearchStart');
  
      this.vent.bind("searchStarted", this.onSearchStart);
      this.vent.bind("switchedCurrentPlayingPlaylist", this.setCurrentPlayingPlaylist);
      this.model.bind('destroy', this.remove);
  
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
    
    events: {
      'click .delete' : 'deletePlaylist',
      'click .name' : 'switchToPlaylist',
    },
    
    // Delete playlist , unbind events and remove view, reorder playlists after delete.
    deletePlaylist: function(e){
      this.unbind();
      this.model.collection = this.playlistsCollection; //HACK this.model did not have collection. delete was not working
      this.model.destroy();
      this.playlistsCollection.reorderAfterDelete();
    },
  
    remove: function() {
      $(this.el).remove();
    },
  
    render: function() {
      $(this.el).html(this.$template(this.model.toJSON()));
      return this;
    },
    
    onSearchStart: function() {
      // When a search starts make sure we set this to false so that we do not react to video ended events anymore.
      this.currentPlayingPlaylist = false;
    },
    
    switchToPlaylist: function() {
      this.vent.trigger('switchedCurrentPlayingPlaylist', this.model.get('id'));
      // Hide search results.
      $('#search_results_view').hide();
      //make a playlistContentView
      var playlistContentView = new PlayListContentView({
        'model': this.model,
      });
    },
    
    setCurrentPlayingPlaylist: function(currentPlaylistId) {
      this.currentPlayingPlaylist = (currentPlaylistId == this.model.get('id'))
    },
  });
  
  return PlayListItemView;
});
