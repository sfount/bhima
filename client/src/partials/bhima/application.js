angular.module('bhima.controllers')
.controller('app', [
  'EVENTS',
  '$scope',
  '$location',
  '$translate',
  '$timeout',
  'appauth',
  'appcache',
  'appstate',
  'connect',
  'validate',
  'util',
  'exchange',
  'SessionService',
  function (EVENTS, $scope, $location, $translate, $timeout, appauth, Appcache, appstate, connect, validate, util, exchange, SessionService) {
    // TODO
    // Something should probably go in here.
    
    if (!SessionService.user) {
      $location.url('/login');
    }

  }
]);
