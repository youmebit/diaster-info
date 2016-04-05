var app = angular.module('myApp', ['onsen']);
app.controller('bodyCtrl', function($scope) {
    $scope.settings = {};
    $scope.settings.isHiddenTab = false;
});

app.controller('tabCtrl', function($scope) {
    $scope.init = function () {
      $scope.tabs = [];
    }
});
