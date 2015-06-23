(function(){
  'use strict';

  // Declare app level module which depends on views, and components
  var app = angular.module('csCardDemo', [
      'csCardDemo.home',
      'infinite-scroll',
      'ngSanitize'
  ]);

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
