(function(){
  'use strict';

  // Declare app level module which depends on views, and components
  var app = angular.module('csCardDemo', [
      'csCardDemo.home',
      'infinite-scroll',
      'ngSanitize'
  ]);

  // Your appId and appKey from CardStreams
  app.constant('CONFIG', {
    app_id: "YOUR_APP_ID",
    app_key: "YOUR_APP_KEY",
    streamId: "YOUR_STREAM_ID"
  });

  // Use the angular sanitize filter for the description content. This allows a mixture of "safe" and "unsafe" content.
  // For more information, see: https://docs.angularjs.org/api/ngSanitize/service/$sanitize
  app.filter("safe", function($sce)
  {
    return function (val)
    {
      return $sce.trustAsHtml(val);
    }
  });

})();
