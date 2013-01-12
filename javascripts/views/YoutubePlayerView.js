define([
  'backbone',
  'eventBus',
], function(Backbone, vent){
  var YoutubePlayerView = Backbone.View.extend({
    initialize: function(options) {
      this.apiReady = false;
      this.panelShowing = 0;
      this.vent = vent;
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
         this.player.playVideo();
      },
  
      stateChanged: function(event) {
        if (event.data == YT.PlayerState.ENDED) {
          this.videoEnded();
        }
      },
  
      videoEnded: function() {
        // Let other parties know that a video ended.
        this.vent.trigger("videoEnded")
      },
  
      apiError: function(error) {
        alert("Error is " + error);
      }
    });
    
    var YoutubePlayer = new YoutubePlayerView();
    return YoutubePlayer;
});
