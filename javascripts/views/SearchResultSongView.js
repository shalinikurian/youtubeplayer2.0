define([
  'backbone'
], function(Backbone){
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
  
  return SearchResultSongView;
});
