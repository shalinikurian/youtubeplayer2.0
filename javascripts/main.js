//events
var vent = _.extend({} , Backbone.Events);

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
/*
 * Models
 */

var Song = Backbone.Model.extend({});

var Playlist = Backbone.Model.extend({
	defaults: {
		name: "New Playlist"
	},
	
	initialize: function() {
		this.songs = new Songs();
		this.songs.setLocalStore(this.id);
		this.songs.fetch();
	},
	
	addSong: function(songToAdd) {
		var song = new Song(songToAdd.toJSON());
		song.set('order', this.songs.getNextOrder());
		//do we need to add playlist no?
		this.songs.create(song);
		this.songs.last().save();
	},
	
	playlistDuration: function() {
		var totalDuration = 0;
		_.each(this.songs.models, function(song){
			totalDuration = totalDuration + song.get('actual_duration');
		}.bind(this));
		
		return durationForDisplay(totalDuration);
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
	
	playSong: function() { //TODO
		
	}
});

var PlayListsView = Backbone.View.extend({
	el : '#left_nav',
	
	initialize: function(args){
		this.vent = args.vent;
		this.$textBox = $('#new_playlist_name');
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
	
	reorderPlaylists: function(e, ui) {
		var playlistsOrder = $(e.target).sortable('toArray');
		playlistsCollection.reorderAfterSorting(playlistsOrder);
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
	
	className: 'playlistItem',
	
	initialize: function(args) {
		this.vent = args.vent;
		this.playlistView = $('#playlist_view');
		$(this.el).attr('id', this.model.id);
		this.model.bind('destroy', this.remove, this);
		this.$template = _.template($('#playlist_template').html());
		$(this.el).droppable({
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
		'click' : 'playPlaylist'
	},
	
	deletePlaylist: function(e){
		this.model.destroy();
		playlistsCollection.reorderAfterDelete();
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
	
	playPlaylist: function() {
		//hide search results
	    $('#search_results_view').hide();
	    //show playlist view
	    this.showPlayList();
	},
	
	showPlayList: function() {
		this.playlistView.html('').show();
		var noOfSongs = this.model.songs.length;
		if (noOfSongs == 0 ){
			
		}else {
			
		}
		var playlistTemplate = (noOfSongs == 0) ? (_.template($('#playlist_info_template_no_songs').html())) : (_.template($('#playlist_info_template').html()));
		var variables = (noOfSongs == 0) ? {} : {"thumbnail1": this.model.songs.last().get('thumbnail')};
		this.playlistView.append(playlistTemplate(variables));
		
		//general info
		
		var generalInfoTemplate = _.template($('#playlist_info_template_general').html());
		variables = {
			"title":this.model.get('name'),
			"noOfSongs" : this.model.songs.length , 
			"duration": (noOfSongs == 0 ) ? '0 s' : this.model.playlistDuration()
	    };
	    this.playlistView.append(generalInfoTemplate(variables));		
	}

});


/*
 * collections
 */

var Songs = Backbone.Collection.extend({
	model : Song,
	
	localStorage: new Store(""),
	
	setLocalStore: function (id) {
		var localKey = "playlist"+id;
		this.localStorage = new Store(localKey); //window needed ?
	},
	
	getNextOrder : function() {
		if (this.length == 0) return 1;
		return this.last().get('order') + 1;
	},
	
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
