angular.module('bhima.controllers')
.controller('taxes_management.menu', [
  '$scope',
  '$location',
  '$translate',
  function ($scope, $location, $translate) {

    var configuration = $scope.configuration = {};

    configuration.operations = [
      {
        key : $translate.instant('TAXE_MANAGEMENT.CREATE_TAXE'),
        link : '/taxes_management/create/'
      },

      {
       key : $translate.instant('TAXE_MANAGEMENT.CONFIGURE_IPR'),
       link : '/taxes_management/ipr/'
      },

      {
       key : $translate.instant('CONFIG_TAX.TITLE'),
       link : '/taxes_management/config_tax/'
      }      
    ];

    $scope.loadPath = function loadPath(path) {
      $location.path(path);
    };
  }
]);
