//events
var vent = _.extend({} , Backbone.Events);
/*
 * Models
 */

var Song = Backbone.Model.extend({});
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
	}
});
/*
 * Initialize the application
 */
function appInit() {
	window.searchResultsView = new SearchResultsView({el:'body', vent:vent, maxResults:10});
}

$(document).ready(function() {
	appInit();
});
