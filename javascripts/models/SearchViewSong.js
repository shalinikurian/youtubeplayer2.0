define([
  'backbone',
  'models/Song'
], function(Backbone, Song){
  var SearchViewSong = Song.extend({

    parse: function(response){
      var attributes = {
        'title' : response.title,
        'thumbnail' : response.thumbnail.sqDefault,
        'duration': this.durationForDisplay(response.duration),
        'actual_duration': response.duration,
        'song_id': response.id
      }
      return attributes;
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
  
  return SearchViewSong;
});
