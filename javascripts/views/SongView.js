define([
  'backbone',
  'eventBus'
], function(Backbone, vent){
  var SongView = Backbone.View.extend({

    events: {
      'click .song' : 'playSong',
      'click .delete' : 'deleteSong'
    },
  
    initialize: function(args) {
      var evenRow = (this.model.get('order') % 2 == 0 );
      this.vent = vent;
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
  
  return SongView;
});
