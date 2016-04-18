app.controller('loginCtrl', function($scope, mBaasService) {
    $scope.signIn = function() {
        alert($scope.login.email + ":" + $scope.login.password);
    }
});