var app = angular.module('myApp', ['onsen']);
app.controller('firstController', function($scope) {
  $scope.pageName = 'aa';
});

app.controller('tabCtrl', function($scope) {
    $scope.init = function () {
      $scope.tabs = [];
    }
});
