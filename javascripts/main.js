//events
var vent = _.extend({} , Backbone.Events);
/*
 * Models
 */

var Song = Backbone.Model.extend({});

var Playlist = Backbone.Model.extend({
	defaults: {
		name: "New Playlist"
	},
	
	initialize: function() {
		
	}
});
/*
 * Views
 */

var SearchResultsView = Backbone.View.extend({
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
		if (e.keyCode == 13) {//enter
			var query = this.$searchBar.val();
			this.fetchQueryFromYoutube(query);
		}
	},
	
	fetchQueryFromYoutube: function(query) {
		var youtubeUrl = "https://gdata.youtube.com/feeds/api/videos?q="+query+"&max-results="+this.maxResults+"&v=2&alt=jsonc&callback=?";

		$.getJSON(youtubeUrl, function(data){
			this.populateSearchResults(data);
		}.bind(this));
	},
	
	populateSearchResults: function(data) {
		this.$searchResultsContainer.html('');
		$.each(data.data.items, function(index, song){
			this.addSong(song);
		}.bind(this));
	},
	
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

var SearchResultSongView = Backbone.View.extend({
	initialize: function() {
		this.$searchResultItem = $(this.el);
		this.$searchResultItem.addClass('search_result_item');
		this.template = _.template($('#search_result_template').html());
	},
	
	render: function() {
		this.$searchResultItem.html(this.template(this.model.toJSON()));
		return this;
	},
	
	events: {
		'click .thumbnail' : 'playSong'
	},
	
	playSong: function() { //TODO
		
	}
});

var PlayListsView = Backbone.View.extend({
	el : '#left_nav',
	
	initialize: function(args){
		this.vent = args.vent;
		this.$textBox = $('#new_playlist_name');
		this.$playlists = $('#playlists');
		$(this.el).menu();
		this.render();
	},
	
	events: {
		'click #add_playlist' : 'showNewPlayListTextBox',
		'keyup #new_playlist_name' : 'addNewPlayList'
	},
	
	render: function() {
		_.each(playlistsCollection.models, function(playlist){
			this.appendPlaylistToView(playlist);
		}.bind(this));
	},
	
	showNewPlayListTextBox: function(e) {
		this.$textBox.val('');
		this.$textBox.slideDown('fast', function(){});
		this.$textBox.focus();
	},
	
	addNewPlayList: function(e) {
		if (e.which == 27) {
			this.$textBox.slideUp('fast', function(){});
		}
		
		if (e.keyCode == 13) {
			this.$textBox.slideUp('fast', function(){});
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
		
	appendPlaylistToView: function(playlist) {
		var playlistView = new PlayListView({
			model: playlist,
			vent: vent
		});
			
		this.$playlists.append(playlistView.render().el);
	}
});

var PlayListView = Backbone.View.extend({
	tagName : 'div',
	
	initialize: function(args) {
		this.vent = args.vent;
		this.model.bind('destroy', this.remove, this);
		this.$template = _.template($('#playlist_template').html());
	},
	
	events: {
		'click .delete' : 'deletePlaylist'
	},
	
	deletePlaylist: function(e){
		this.model.destroy();
	},
	
	remove: function() {
		$(this.el).remove();
	},
	
	showOptions: function(e) {
		var $target = $(e.target);
		$(this.el).find('.options').show();
	},
	
	hideOptions: function(e) {
		var $target = $(e.target);
		$(this.el).find('.options').hide();
	},
	
	render: function() {
		$(this.el).html(this.$template(this.model.toJSON()));
		return this;
	},

});


/*
 * collections
 */

var PlayListCollection = Backbone.Collection.extend({
	model: Playlist,
	
	localStorage: new Store("playlists"),
	
	getNextOrder : function() {
		if (this.length == 0) return 1;
		return this.last().get('order') + 1;
	}
});
/*
 * Initialize the application
 */
function appInit() {
	window.searchResultsView = new SearchResultsView({el:'body', vent:vent, maxResults:10});
	window.playlistsCollection = new PlayListCollection;
	playlistsCollection.fetch();
    window.playListsView = new PlayListsView({vent: vent});
}

$(document).ready(function() {
	appInit();
});
