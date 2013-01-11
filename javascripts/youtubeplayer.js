require.config({
  
  paths: {
    jQuery: 'libs/jquery/jquery',
    jQueryUi: 'libs/jquery/jquery-ui.min',
    underscore: 'libs/underscore-min',
    backbone: 'libs/backbone/backbone-min',
    localStorage: 'libs/backbone/backbone.localStorage'
  },
  
  'shim': {
    backbone: {
      'deps': ['jQuery', 'underscore'],
      'exports': 'Backbone'
    },
    
    jQueryUi: {
      'deps': ['jQuery'],
      'exports': '$ui'
    },

    underscore: {
      'exports' : '-'
    },
    
    jQuery: {
      'exports': '$'
    }
  }
});

require([
  'jQuery',
  'jQueryUi',
  'underscore',
  'backbone',
  'app'
], function($, $ui, _, Backbone, App){
  debugger;
  App.initialize();
});
